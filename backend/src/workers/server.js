// ============================================
// src/workers/server.js
// ============================================
require('dotenv').config();
const { connectDB } = require('../db/connection');
const {
  documentProcessingQueue,
  aiAnalysisQueue,
  emailQueue,
  shutdownQueues
} = require('../config/queue');
const { documentProcessor, aiProcessor, emailProcessor } = require('./processors');
const logger = require('../utils/logger');

class WorkerServer {
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
      documentProcessingQueue.process(
        'process-document',
        this.concurrency,
        async (job) => await documentProcessor.process(job)
      );

      aiAnalysisQueue.process(
        'analyze-quote',
        this.concurrency,
        async (job) => await aiProcessor.process(job)
      );

      emailQueue.process(
        'send-email',
        this.concurrency,
        async (job) => await emailProcessor.process(job)
      );

      logger.info(`Worker server started with concurrency: ${this.concurrency}`);
      logger.info('Ready to process jobs...');
    } catch (error) {
      logger.error('Worker failed to start:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    logger.info('Worker shutting down gracefully...');

    try {
      await shutdownQueues();

      const mongoose = require('mongoose');
      await mongoose.connection.close();

      logger.info('Worker shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

const worker = new WorkerServer();

worker.start().catch((error) => {
  logger.error('Worker startup failed:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => worker.shutdown());
process.on('SIGINT', () => worker.shutdown());

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection in worker:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in worker:', error);
  worker.shutdown();
});