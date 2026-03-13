// ============================================
// src/api/routes/ai.routes.js
// ============================================

const express = require('express');
const router = express.Router();

// Controllers
const {
    analyzeQuote,
    compareQuotes
} = require('../controllers/ai.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const aiRateLimiter = require('../middleware/aiRateLimit.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   POST /api/v1/ai/analyze
 * @desc    Analyze a single quote (Free / Standard / Premium)
 * @access  Authenticated users
 */
router.post(
    '/analyze',
    authenticate,        // 🔐 Must be authenticated
    uploadLimiter,       // ⏫ Prevent upload abuse
    aiRateLimiter,       // 🤖 AI usage limits per tier
    async (req, res, next) => {
        try {
            await analyzeQuote(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/v1/ai/compare
 * @desc    Compare multiple quotes (Premium only)
 * @access  Authenticated users (tier checked in controller)
 */
router.post(
    '/compare',
    authenticate,        // 🔐 Must be authenticated
    aiRateLimiter,       // 🤖 AI usage limits per tier
    async (req, res, next) => {
        try {
            await compareQuotes(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;