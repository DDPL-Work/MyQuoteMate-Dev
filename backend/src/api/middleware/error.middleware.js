// backend/src/api/middleware/error.middleware.js
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

class ErrorMiddleware {
  /**
   * Global error handler
   */
  handler(err, req, res, next) {
    // Log the error
    this.logError(err, req);
    
    // Determine status code
    const statusCode = err.statusCode || 500;
    
    // Prepare error response
    const errorResponse = {
      success: false,
      error: err.message || 'Internal Server Error',
      requestId: req.id,
      timestamp: new Date().toISOString()
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.name = err.name;
    }
    
    // Add validation errors if present
    if (err.details && Array.isArray(err.details)) {
      errorResponse.details = err.details;
    }
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      errorResponse.error = 'Validation Error';
      errorResponse.details = Object.values(err.errors).map(e => e.message);
    }
    
    if (err.name === 'JsonWebTokenError') {
      errorResponse.error = 'Invalid token';
      statusCode = 401;
    }
    
    if (err.name === 'TokenExpiredError') {
      errorResponse.error = 'Token expired';
      statusCode = 401;
    }
    
    // Send error response
    res.status(statusCode).json(errorResponse);
  }
  
  /**
   * Log error with context
   */
  logError(err, req) {
    const logData = {
      id: req.id,
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?._id,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    };
    
    // Determine log level
    if (err.statusCode >= 500 || !err.isOperational) {
      logger.error('Server error', logData);
    } else if (err.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else {
      logger.info('Error', logData);
    }
  }
  
  /**
   * 404 handler
   */
  notFound(req, res, next) {
    const err = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(err);
  }
  
  /**
   * Async error wrapper
   */
  catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }
}

module.exports = new ErrorMiddleware();