// ============================================
// backend/src/api/middleware/rateLimit.middleware.js
// ============================================

const rateLimit = require('express-rate-limit');

/**
 * Shared base configuration
 * NOTE:
 * - In production at scale, replace memory store with Redis
 */
const baseConfig = {
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  }
};

/**
 * Safely generate a rate-limit key
 */
const getUserKey = (req) => {
  if (req.user && req.user._id) {
    return `${req.ip}-${req.user._id.toString()}`;
  }
  return req.ip;
};

/**
 * Global rate limiter
 * Applies to ALL API routes
 */
const globalLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to avoid frequent 429s
  keyGenerator: getUserKey,
  skip: (req) =>
    req.path === '/health' ||
    req.path === '/health/detailed' ||
    req.path.includes('/pricing') // Skip limiting for pricing to avoid frontend blockers
});

/**
 * Authentication limiter
 * Login / Register / Token endpoints
 */
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip
});

/**
 * Upload limiter
 * PDF / Image uploads (expensive operations)
 */
const uploadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: getUserKey,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Upload limit reached. Please try again later.'
    });
  }
});

/**
 * API Key limiter
 * Partner / Webhook access
 */
const apiKeyLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) =>
    req.headers['x-api-key'] || req.ip
});

/**
 * Strict limiter
 * Password reset, OTP, sensitive actions
 */
const strictLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Too many attempts. Please wait before retrying.'
    });
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  apiKeyLimiter,
  strictLimiter
};