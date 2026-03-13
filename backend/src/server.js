const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const { connectDB, disconnectDB } = require('./db/connection');
const { shutdownQueues, initializeQueues } = require('./config/queue');
const routes = require('./api/routes');
const errorMiddleware = require('./api/middleware/error.middleware');
const rateLimitMiddleware = require('./api/middleware/rateLimit.middleware');
const logger = require('./utils/logger');
const crypto = require('crypto');
// Initialize Express app
const app = express();
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:5174',
  'https://my-quote-text-opie2cc4t-pranjals-projects-37b353eb.vercel.app',
  'https://my-quote-text.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In production, we'll be more permissive for now to resolve deployment blockers
    if (process.env.NODE_ENV === 'production') {
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app');

      if (!isAllowed) {
        logger.warn('CORS blocked', { origin });
        return callback(new Error('Not allowed by CORS'));
      }

      return callback(null, true);
    }


    // Check if origin is in allowedOrigins or is a vercel subdomain
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      // In production we still allow but log it, to avoid breaking the app during transition
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Request-Id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ============================================
// PARSING MIDDLEWARE
// ============================================

// Cookie parser
app.use(cookieParser());

// Passport initialization
const passport = require('./config/passport');
app.use(passport.initialize());

// Body parsing
app.use((req, res, next) => {
  if (req.originalUrl.includes('/payments/webhook')) {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stripe Webhook needs raw body
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(cookieParser());

// ============================================
// COMPRESSION & SECURITY
// ============================================

app.use(compression());

// NoSQL injection protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Potential NoSQL injection attempt detected: ${key}`, {
      ip: req.ip,
      path: req.path
    });
  }
}));

// ============================================
// LOGGING
// ============================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// ============================================
// RATE LIMITING
// ============================================

app.use(rateLimitMiddleware.globalLimiter);

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const { checkConnection } = require('./db/connection');
    const { checkQueueHealth } = require('./config/queue');

    const [dbHealthy, queueHealth] = await Promise.allSettled([
      checkConnection(),
      checkQueueHealth()
    ]);

    const dbStatus = dbHealthy.status === 'fulfilled' ? dbHealthy.value : false;
    const queueStatus = queueHealth.status === 'fulfilled' ? queueHealth.value : { status: 'error' };

    const overallStatus = dbStatus &&
      Object.values(queueStatus).every(q => q.status === 'healthy');

    res.status(overallStatus ? 200 : 503).json({
      status: overallStatus ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'healthy', uptime: Math.floor(process.uptime()) },
        database: { status: dbStatus ? 'healthy' : 'unhealthy', type: 'MongoDB' },
        queues: queueStatus,
        redis: { status: Object.keys(queueStatus).length > 0 ? 'healthy' : 'unhealthy' }
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

// ============================================
// API ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({
    name: 'MyQuoteMate API',
    version: process.env.API_VERSION || 'v1',
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    documentation: `${process.env.API_BASE_URL || 'https://myquotemate-7u5w.onrender.com'}/docs`,
    endpoints: {
      health: '/health',
      healthDetailed: '/health/detailed',
      api: `/api/${process.env.API_VERSION || 'v1'}`
    }
  });
});

// Mount API routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorMiddleware.handler.bind(errorMiddleware));

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  let shutdownTimer;

  const forceShutdown = () => {
    logger.error('Graceful shutdown timeout - forcing exit');
    process.exit(1);
  };

  // Set force shutdown timer
  shutdownTimer = setTimeout(forceShutdown, 30000);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        logger.info('Closing MongoDB connection...');
        await disconnectDB();
        logger.info('MongoDB connection closed');

        logger.info('Closing job queue connections...');
        await shutdownQueues();
        logger.info('Job queues closed');

        clearTimeout(shutdownTimer);
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        clearTimeout(shutdownTimer);
        process.exit(1);
      }
    });
  } else {
    clearTimeout(shutdownTimer);
    process.exit(0);
  }
};

// Process event handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });

  if (process.env.NODE_ENV === 'production') {
    logger.error('Unhandled rejection in production');
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('MongoDB connected successfully');

    // Initialize Queues
    try {
      logger.info('Initializing Job Queues...');
      await initializeQueues();
      logger.info('Job Queues ready');
    } catch (queueError) {
      logger.warn('Failed to initialize Job Queues (Redis down?). Background processing will be disabled or degraded.', { error: queueError.message });
      // Do not exit, allow server to start
    }

    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 MyQuoteMate Backend Server Started Successfully          ║
║                                                               ║
║   Environment:  ${(process.env.NODE_ENV || 'development').padEnd(44)}║
║   Port:         ${String(PORT).padEnd(44)}║
║   API Version:  ${(process.env.API_VERSION || 'v1').padEnd(44)}║
║   Node Version: ${process.version.padEnd(44)}║
║                                                               ║
║   🌐 API URL:    http://localhost:${PORT}${' '.repeat(27)}║
║   📚 API Docs:   http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}${' '.repeat(15)}║
║   ❤️  Health:     http://localhost:${PORT}/health${' '.repeat(20)}║
║                                                               ║
║   Press Ctrl+C to stop${' '.repeat(34)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);

      logger.info('Server configuration:', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        apiVersion: process.env.API_VERSION || 'v1'
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing
module.exports = app;