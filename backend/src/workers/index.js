require('dotenv').config();
const { connectDB } = require('../db/connection');
const {
  documentProcessingQueue,
  aiAnalysisQueue,
  emailQueue,
  retentionQueue
} = require('../config/queue');
const logger = require('../utils/logger');

// Import processors
const documentProcessor = require('./processors/documentProcessor');
const aiProcessor = require('./processors/aiProcessor');
const emailProcessor = require('./processors/emailProcessor');
const retentionProcessor = require('./processors/retentionProcessor');

/**
 * Worker Process - Handles async job processing
 */
class WorkerManager {
  constructor() {
    this.isShuttingDown = false;
    this.concurrency = parseInt(process.env.QUEUE_CONCURRENCY) || 5;
  }

  async start() {
    try {
      // Connect to MongoDB
      await connectDB();
      logger.info('Worker connected to MongoDB');

      // Register processors
      documentProcessingQueue.process('process-document', this.concurrency, documentProcessor.process);
      aiAnalysisQueue.process('analyze-quote', this.concurrency, aiProcessor.process);
      emailQueue.process('send-email', this.concurrency, emailProcessor.process);
      retentionQueue.process('cleanup-expired', 2, retentionProcessor.process);

      // Global event handlers
      this.setupEventHandlers();

      logger.info(`Worker started with concurrency: ${this.concurrency}`);
      logger.info('Listening for jobs...');
    } catch (error) {
      logger.error('Failed to start worker:', error);
      process.exit(1);
    }
  }

  setupEventHandlers() {
    // Document processing events
    documentProcessingQueue.on('completed', (job, result) => {
      logger.info(`Document processed: ${job.id}`, { result });
    });

    documentProcessingQueue.on('failed', (job, err) => {
      logger.error(`Document processing failed: ${job.id}`, { error: err.message });
    });

    // AI analysis events
    aiAnalysisQueue.on('completed', (job, result) => {
      logger.info(`AI analysis completed: ${job.id}`);
    });

    aiAnalysisQueue.on('failed', (job, err) => {
      logger.error(`AI analysis failed: ${job.id}`, { error: err.message });
    });

    // Email events
    emailQueue.on('completed', (job) => {
      logger.info(`Email sent: ${job.id}`);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email failed: ${job.id}`, { error: err.message });
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    logger.info('Shutting down worker gracefully...');

    try {
      // Close all queues
      await Promise.all([
        documentProcessingQueue.close(),
        aiAnalysisQueue.close(),
        emailQueue.close(),
        retentionQueue.close()
      ]);

      logger.info('All queues closed');

      // Close MongoDB connection
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      
      logger.info('Worker shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during worker shutdown:', error);
      process.exit(1);
    }
  }
}

// Initialize worker
const worker = new WorkerManager();

// Start worker
worker.start().catch((error) => {
  logger.error('Worker startup failed:', error);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => worker.shutdown());
process.on('SIGINT', () => worker.shutdown());

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection in worker:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception in worker:', error);
  worker.shutdown();
});