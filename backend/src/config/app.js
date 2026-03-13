// src/config/app.js
module.exports = {
  app: {
    name: process.env.APP_NAME || 'MyQuoteMate',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    apiVersion: process.env.API_VERSION || 'v1'
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf']
  },
  
  retention: {
    freeTierDays: parseInt(process.env.FREE_TIER_RETENTION_DAYS) || 7,
    paidTierDays: parseInt(process.env.PAID_TIER_RETENTION_DAYS) || 365,
    pdfRetentionDays: parseInt(process.env.PDF_RETENTION_DAYS) || 90
  }
};