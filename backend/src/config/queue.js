// backend/src/config/queue.js
const Queue = require('bull');
const Redis = require('ioredis');
const logger = require('../utils/logger');

class QueueManager {
  constructor() {
    this.queues = {};
    this.redisClient = null;
    this.redisSubscriber = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    if (this.isConnected) return;

    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryStrategy: (times) => {
          // Stop retrying after 3 attempts to prevent log spam
          if (times > 3) {
            logger.warn('⚠️  Redis not available. Background jobs disabled. App will continue without queues.');
            return null; // Stop retrying
          }
          const delay = Math.min(times * 100, 1000);
          return delay;
        },
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        autoResubscribe: false,
        autoResendUnfulfilledCommands: false,
        lazyConnect: true, // Don't connect immediately
        enableOfflineQueue: false, // Don't queue commands when offline
        showFriendlyErrorStack: false
      };

      // Create Redis clients
      this.redisClient = new Redis(redisConfig);
      this.redisSubscriber = new Redis(redisConfig);

      // Suppress error logging
      this.redisClient.on('error', () => {
        // Silently ignore errors to prevent console spam
      });

      this.redisSubscriber.on('error', () => {
        // Silently ignore errors
      });

      // Test connection
      await this.redisClient.ping();

      this.isConnected = true;
      logger.info('Redis connected successfully');

      // Handle connection events
      this.redisClient.on('error', (error) => {
        logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis client reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Create a queue with production settings
   */
  createQueue(name, options = {}) {
    if (!this.isConnected) {
      logger.warn(`Redis not connected. Queue ${name} will not be created.`);
      return null;
    }

    const queueOptions = {
      redis: {
        port: parseInt(process.env.REDIS_PORT) || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined
      },
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 1000, // Keep last 1000 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        timeout: 300000 // 5 minutes timeout
      },
      settings: {
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 2,
        guardInterval: 5000,
        retryProcessDelay: 5000,
        drainDelay: 5
      },
      ...options
    };

    const queue = new Queue(name, queueOptions);

    // Queue event handlers
    queue.on('error', (error) => {
      logger.error(`Queue ${name} error:`, error);
    });

    queue.on('waiting', (jobId) => {
      logger.debug(`Queue ${name}: Job ${jobId} is waiting`);
    });

    queue.on('active', (job) => {
      logger.debug(`Queue ${name}: Job ${job.id} is now active`);
    });

    queue.on('completed', (job, result) => {
      logger.info(`Queue ${name}: Job ${job.id} completed successfully`);
    });

    queue.on('failed', (job, error) => {
      logger.error(`Queue ${name}: Job ${job.id} failed:`, {
        error: error.message,
        attempts: job.attemptsMade,
        data: job.data
      });
    });

    queue.on('stalled', (job) => {
      logger.warn(`Queue ${name}: Job ${job.id} stalled`);
    });

    this.queues[name] = queue;
    return queue;
  }

  /**
   * Get existing queue or create new one
   */
  getQueue(name, options = {}) {
    if (!this.queues[name]) {
      this.queues[name] = this.createQueue(name, options);
    }
    return this.queues[name];
  }

  /**
   * Initialize all queues
   */
  async initializeQueues() {
    await this.initRedis();

    // Create all required queues
    const queues = {
      'document-processing': {
        defaultJobOptions: {
          priority: 1,
          attempts: 5,
          timeout: 600000 // 10 minutes for processing
        }
      },
      'ai-analysis': {
        defaultJobOptions: {
          priority: 2,
          attempts: 3,
          timeout: 300000 // 5 minutes for AI analysis
        }
      },
      'email-notifications': {
        defaultJobOptions: {
          priority: 3,
          attempts: 3,
          timeout: 60000 // 1 minute for emails
        }
      },
      'data-cleanup': {
        defaultJobOptions: {
          priority: 4,
          attempts: 1,
          delay: 3600000 // Run every hour
        }
      }
    };

    Object.entries(queues).forEach(([name, options]) => {
      this.getQueue(name, options);
    });

    logger.info(`Initialized ${Object.keys(queues).length} queues`);
  }

  /**
   * Check queue health
   */
  async checkQueueHealth() {
    const health = {};

    for (const [name, queue] of Object.entries(this.queues)) {
      try {
        const counts = await queue.getJobCounts();
        const isHealthy = await queue.client.ping() === 'PONG';

        health[name] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          counts,
          clientStatus: isHealthy ? 'connected' : 'disconnected'
        };
      } catch (error) {
        logger.error(`Health check failed for queue ${name}:`, error);
        health[name] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return health;
  }

  /**
   * Shutdown all queues gracefully
   */
  async shutdownQueues() {
    logger.info('Shutting down queues...');

    const shutdownPromises = Object.values(this.queues).map(async (queue) => {
      try {
        await queue.close();
        logger.info(`Queue ${queue.name} closed`);
      } catch (error) {
        logger.error(`Failed to close queue ${queue.name}:`, error);
      }
    });

    await Promise.all(shutdownPromises);

    // Close Redis connections
    if (this.redisClient) {
      await this.redisClient.quit();
    }

    if (this.redisSubscriber) {
      await this.redisSubscriber.quit();
    }

    this.isConnected = false;
    logger.info('All queues and Redis connections closed');
  }

  /**
   * Clean old jobs from queues
   */
  async cleanOldJobs(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    for (const [name, queue] of Object.entries(this.queues)) {
      try {
        const jobs = await queue.getJobs(['completed', 'failed']);
        const oldJobs = jobs.filter(job => job.timestamp < cutoff);

        for (const job of oldJobs) {
          await job.remove();
        }

        logger.info(`Cleaned ${oldJobs.length} old jobs from ${name} queue`);
      } catch (error) {
        logger.error(`Failed to clean old jobs from ${name}:`, error);
      }
    }
  }
}

// Create singleton instance
const queueManager = new QueueManager();

// Export commonly used queues and methods
module.exports = {
  // Queue instances
  documentProcessingQueue: null,
  aiAnalysisQueue: null,
  emailQueue: null,

  // Initialize function
  initializeQueues: async () => {
    await queueManager.initializeQueues();

    module.exports.documentProcessingQueue = queueManager.getQueue('document-processing');
    module.exports.aiAnalysisQueue = queueManager.getQueue('ai-analysis');
    module.exports.emailQueue = queueManager.getQueue('email-notifications');

    return queueManager;
  },

  // Helper methods
  checkQueueHealth: () => queueManager.checkQueueHealth(),
  shutdownQueues: () => queueManager.shutdownQueues(),
  cleanOldJobs: (days) => queueManager.cleanOldJobs(days),
  getQueue: (name) => queueManager.getQueue(name)
};