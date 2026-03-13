// src/services/retention/retentionService.js
const cron = require('cron');
const Job = require('../../models/Job');
const Document = require('../../models/Document');
const Result = require('../../models/Result');
const s3Service = require('../storage/s3Service');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

/**
 * Data Retention Service - Handles automatic cleanup
 * Complies with Australian Privacy Principles
 */
class RetentionService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start scheduled cleanup jobs
   */
  startScheduledCleanup() {
    // Run daily at 2 AM
    const dailyJob = new cron.CronJob('0 2 * * *', async () => {
      logger.info('Running scheduled data retention cleanup');
      await this.cleanupExpiredData();
    });

    dailyJob.start();
    logger.info('Data retention scheduler started');
  }

  /**
   * Cleanup expired data based on retention policies
   */
  async cleanupExpiredData() {
    if (this.isRunning) {
      logger.warn('Cleanup already in progress, skipping');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      logger.info('Starting data retention cleanup...');

      // Cleanup expired jobs
      const jobsDeleted = await this.cleanupExpiredJobs();
      
      // Cleanup old PDFs (earlier than results)
      const pdfsDeleted = await this.cleanupOldPDFs();
      
      // Cleanup orphaned documents
      const orphansDeleted = await this.cleanupOrphanedDocuments();

      const duration = Date.now() - startTime;

      // Audit log
      await AuditLog.log({
        action: 'system.retention_cleanup',
        resourceType: 'system',
        details: {
          jobsDeleted,
          pdfsDeleted,
          orphansDeleted,
          durationMs: duration
        },
        severity: 'info'
      });

      logger.info(`Retention cleanup completed in ${duration}ms`, {
        jobsDeleted,
        pdfsDeleted,
        orphansDeleted
      });

    } catch (error) {
      logger.error('Retention cleanup failed:', error);
      
      await AuditLog.log({
        action: 'system.retention_cleanup',
        resourceType: 'system',
        details: {
          error: error.message
        },
        result: 'failure',
        severity: 'error'
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Delete expired jobs and associated data
   */
  async cleanupExpiredJobs() {
    try {
      const now = new Date();
      
      // Find expired jobs
      const expiredJobs = await Job.find({
        expiresAt: { $lt: now },
        deletedAt: null
      }).populate('documents');

      logger.info(`Found ${expiredJobs.length} expired jobs to delete`);

      let deletedCount = 0;

      for (const job of expiredJobs) {
        try {
          // Delete documents from S3
          const storageKeys = job.documents
            .filter(doc => doc.storageKey)
            .map(doc => doc.storageKey);

          if (storageKeys.length > 0) {
            await s3Service.deleteFiles(storageKeys);
          }

          // Soft delete documents
          await Document.updateMany(
            { jobId: job._id },
            { deletedAt: now }
          );

          // Delete result
          await Result.deleteOne({ jobId: job._id });

          // Soft delete job
          job.deletedAt = now;
          await job.save();

          deletedCount++;

          logger.debug(`Deleted expired job: ${job.jobId}`);

        } catch (jobError) {
          logger.error(`Failed to delete job ${job.jobId}:`, jobError);
        }
      }

      return deletedCount;

    } catch (error) {
      logger.error('Failed to cleanup expired jobs:', error);
      throw error;
    }
  }

  /**
   * Delete old PDFs (keep results longer than raw files)
   */
  async cleanupOldPDFs() {
    try {
      const now = new Date();
      
      // Find documents past their deletion date
      const oldDocuments = await Document.find({
        deleteFileAt: { $lt: now },
        deletedAt: null
      });

      logger.info(`Found ${oldDocuments.length} old PDFs to delete`);

      let deletedCount = 0;

      for (const doc of oldDocuments) {
        try {
          // Delete from S3
          await s3Service.deleteFile(doc.storageKey);

          // Mark as deleted but keep metadata
          doc.deletedAt = now;
          doc.storageKey = null; // Remove S3 reference
          await doc.save();

          deletedCount++;

        } catch (docError) {
          logger.error(`Failed to delete PDF ${doc._id}:`, docError);
        }
      }

      return deletedCount;

    } catch (error) {
      logger.error('Failed to cleanup old PDFs:', error);
      throw error;
    }
  }

  /**
   * Cleanup orphaned documents (documents without associated job)
   */
  async cleanupOrphanedDocuments() {
    try {
      const orphanedDocs = await Document.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        {
          $match: {
            job: { $size: 0 },
            deletedAt: null
          }
        }
      ]);

      logger.info(`Found ${orphanedDocs.length} orphaned documents`);

      let deletedCount = 0;

      for (const doc of orphanedDocs) {
        try {
          if (doc.storageKey) {
            await s3Service.deleteFile(doc.storageKey);
          }

          await Document.findByIdAndUpdate(doc._id, {
            deletedAt: new Date()
          });

          deletedCount++;

        } catch (docError) {
          logger.error(`Failed to delete orphaned doc ${doc._id}:`, docError);
        }
      }

      return deletedCount;

    } catch (error) {
      logger.error('Failed to cleanup orphaned documents:', error);
      throw error;
    }
  }

  /**
   * Delete user account and all associated data
   */
  async deleteUserAccount(userId) {
    try {
      logger.info(`Deleting all data for user: ${userId}`);

      // Get all user jobs
      const jobs = await Job.find({ userId }).populate('documents');

      // Delete all documents from S3
      for (const job of jobs) {
        const storageKeys = job.documents
          .filter(doc => doc.storageKey)
          .map(doc => doc.storageKey);

        if (storageKeys.length > 0) {
          await s3Service.deleteFiles(storageKeys);
        }
      }

      // Delete all database records
      await Promise.all([
        Document.deleteMany({ userId }),
        Result.deleteMany({ userId }),
        Job.deleteMany({ userId })
      ]);

      logger.info(`All data deleted for user: ${userId}`);

      return {
        jobsDeleted: jobs.length,
        success: true
      };

    } catch (error) {
      logger.error(`Failed to delete user account data for ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new RetentionService();