// backend/src/api/middleware/safe.middleware.js
const logger = require('../../utils/logger');

/**
 * Safe wrapper for route handlers
 * Prevents undefined handler errors
 */
const safe = (handler, name) => {
  if (typeof handler !== 'function') {
    logger.error(`Invalid handler for ${name}:`, handler);
    throw new Error(`Invalid handler function: ${name}`);
  }
  
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { safe };