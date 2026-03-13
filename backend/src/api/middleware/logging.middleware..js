// backend/src/api/middleware/logging.middleware.js
const logger = require('../../utils/logger');

/**
 * Request logging middleware
 * Logs important request details for monitoring and debugging
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override end method to capture response time
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Log request details
    const logData = {
      id: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?._id,
      contentLength: res.get('Content-Length') || '0',
      contentType: res.get('Content-Type')
    };
    
    // Determine log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request warning', logData);
    } else if (process.env.NODE_ENV === 'development') {
      logger.http('Request completed', logData);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Response time header middleware
 * Adds X-Response-Time header to responses
 */
const responseTimeHeader = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

/**
 * Audit logging middleware
 * Logs sensitive operations for audit trail
 */
const auditLogger = (req, res, next) => {
  const shouldAudit = (req.method !== 'GET' && req.method !== 'OPTIONS');
  
  if (shouldAudit) {
    const auditData = {
      id: req.id,
      userId: req.user?._id,
      action: `${req.method} ${req.path}`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log sensitive data (sanitized)
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      
      // Remove sensitive fields from logs
      ['password', 'token', 'secret', 'key', 'authorization'].forEach(field => {
        if (sanitizedBody[field]) {
          sanitizedBody[field] = '***REDACTED***';
        }
      });
      
      auditData.requestBody = sanitizedBody;
    }
    
    logger.info('Audit log', auditData);
  }
  
  next();
};

module.exports = {
  requestLogger,
  responseTimeHeader,
  auditLogger
};