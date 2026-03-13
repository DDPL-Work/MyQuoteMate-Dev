// backend/src/db/connection.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.retryCount = 0;
    this.maxRetries = 10;
    this.retryDelay = 5000;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    if (this.isConnected) {
      logger.debug('MongoDB already connected');
      return this.connection;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2,
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
      connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 30000,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 30000,
      family: 4, // Use IPv4, skip trying IPv6
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      compressors: ['zlib', 'snappy']
    };

    try {
      logger.info('Connecting to MongoDB...', { uri: this.maskUri(mongoUri) });

      // Set up Mongoose event listeners
      this.setupEventListeners();

      // Connect to MongoDB
      await mongoose.connect(mongoUri, options);
      
      this.connection = mongoose.connection;
      this.isConnected = true;
      this.retryCount = 0;
      
      logger.info('MongoDB connected successfully');
      
      return this.connection;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryDelay * Math.pow(1.5, this.retryCount - 1);
        
        logger.warn(`Retrying MongoDB connection in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
        
        await this.sleep(delay);
        return this.connect();
      } else {
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts`);
      }
    }
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connecting', () => {
      logger.info('MongoDB connecting...');
    });

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
      this.isConnected = true;
    });

    mongoose.connection.on('open', () => {
      logger.info('MongoDB connection open');
    });

    mongoose.connection.on('disconnecting', () => {
      logger.warn('MongoDB disconnecting...');
    });

    mongoose.connection.on('disconnected', () => {
      logger.error('MongoDB disconnected');
      this.isConnected = false;
      this.handleDisconnection();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
      this.retryCount = 0;
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('fullsetup', () => {
      logger.info('MongoDB replica set connected');
    });

    mongoose.connection.on('all', () => {
      logger.info('MongoDB all hosts connected');
    });
  }

  /**
   * Handle disconnection with retry
   */
  async handleDisconnection() {
    if (this.isConnected) return;

    try {
      logger.info('Attempting to reconnect to MongoDB...');
      await this.connect();
    } catch (error) {
      logger.error('MongoDB reconnection failed:', error);
      
      // Schedule another retry
      setTimeout(() => this.handleDisconnection(), this.retryDelay);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (!this.isConnected) {
      logger.debug('MongoDB already disconnected');
      return;
    }

    try {
      // Remove event listeners
      mongoose.connection.removeAllListeners();
      
      // Close connection
      await mongoose.disconnect();
      
      this.isConnected = false;
      this.connection = null;
      
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('MongoDB disconnect failed:', error);
      throw error;
    }
  }

  /**
   * Check connection status
   */
  async checkConnection() {
    if (!this.isConnected) {
      return false;
    }

    try {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('MongoDB ping failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    if (!this.connection) {
      return { connected: false };
    }

    const state = this.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      connected: state === 1,
      state: states[state] || 'unknown',
      host: this.connection.host,
      port: this.connection.port,
      name: this.connection.name,
      models: Object.keys(mongoose.models),
      poolSize: this.connection.poolSize || 0
    };
  }

  /**
   * Mask sensitive parts of MongoDB URI for logging
   */
  maskUri(uri) {
    if (!uri) return 'undefined';
    
    try {
      const url = new URL(uri);
      if (url.password) {
        url.password = '***';
      }
      return url.toString();
    } catch {
      // If URL parsing fails, mask password manually
      return uri.replace(/:[^:@]+@/, ':***@');
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const database = new DatabaseConnection();

// Export functions
module.exports = {
  connectDB: () => database.connect(),
  disconnectDB: () => database.disconnect(),
  checkConnection: () => database.checkConnection(),
  getStats: () => database.getStats(),
  isConnected: () => database.isConnected
};