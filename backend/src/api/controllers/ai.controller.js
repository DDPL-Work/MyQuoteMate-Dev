// ============================================
// src/api/controllers/ai.controller.js
// ============================================

const AIOrchestrator = require('../../services/ai/AIOrchestrator');
const logger = require('../../utils/logger');

/**
 * Analyze single quote
 * Free / Standard / Premium
 */
exports.analyzeQuote = async (req, res) => {
    const requestId = req.id;

    try {
        const { extractedText, metadata = {} } = req.body;
        const tier = req.user?.tier || 'free';

        // ---------------- VALIDATION ----------------
        if (!extractedText || typeof extractedText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Extracted text is required and must be a string'
            });
        }

        if (extractedText.length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Extracted text is too short to analyze'
            });
        }

        logger.info('Analyze quote request', {
            requestId,
            userId: req.user?._id?.toString(),
            tier,
            textLength: extractedText.length
        });

        // ---------------- AI PROCESSING ----------------
        const result = await AIOrchestrator.analyzeQuote(
            extractedText,
            tier,
            metadata
        );

        // ---------------- SUCCESS ----------------
        return res.status(200).json({
            success: true,
            tier,
            data: result,
            usage: req.aiUsage || null
        });

    } catch (error) {
        logger.error('Analyze quote controller failed', {
            requestId,
            userId: req.user?._id?.toString(),
            error: error.message,
            stack: error.stack
        });

        // Do NOT leak internal errors to client
        return res.status(500).json({
            success: false,
            error: 'AI analysis failed. Please try again later.'
        });
    }
};

/**
 * Compare multiple quotes
 * Premium only
 */
exports.compareQuotes = async (req, res) => {
    const requestId = req.id;

    try {
        const tier = req.user?.tier;

        // ---------------- TIER ENFORCEMENT ----------------
        if (tier !== 'premium') {
            return res.status(403).json({
                success: false,
                error: 'Quote comparison is available for Premium users only'
            });
        }

        const { quotes, metadata = {} } = req.body;

        // ---------------- VALIDATION ----------------
        if (!Array.isArray(quotes)) {
            return res.status(400).json({
                success: false,
                error: 'Quotes must be an array'
            });
        }

        if (quotes.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'At least two quotes are required for comparison'
            });
        }

        if (quotes.length > 3) {
            return res.status(400).json({
                success: false,
                error: 'A maximum of 3 quotes can be compared'
            });
        }

        logger.info('Compare quotes request', {
            requestId,
            userId: req.user?._id?.toString(),
            quoteCount: quotes.length
        });

        // ---------------- AI PROCESSING ----------------
        const comparison = await AIOrchestrator.compareQuotes(
            quotes,
            metadata
        );

        // ---------------- SUCCESS ----------------
        return res.status(200).json({
            success: true,
            tier,
            data: comparison,
            usage: req.aiUsage || null
        });

    } catch (error) {
        logger.error('Compare quotes controller failed', {
            requestId,
            userId: req.user?._id?.toString(),
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            error: 'Quote comparison failed. Please try again later.'
        });
    }
};