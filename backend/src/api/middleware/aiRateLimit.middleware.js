// ============================================
// backend/src/api/middleware/aiRateLimit.middleware.js
// ============================================

/**
 * In-memory AI usage store
 * ⚠️ Replace with Redis in production scale
 * Key: userId
 * Value: { count, resetAt }
 */
const aiUsageStore = new Map();

/**
 * Tier-based AI limits
 * These are HARD business limits
 */
const AI_LIMITS = {
    free: {
        callsPerHour: 5,
        maxInputChars: 6_000,
        maxOutputTokens: 300
    },
    standard: {
        callsPerHour: 20,
        maxInputChars: 20_000,
        maxOutputTokens: 1_200
    },
    premium: {
        callsPerHour: 50,
        maxInputChars: 40_000,
        maxOutputTokens: 2_000
    }
};

/**
 * AI Rate Limiter Middleware
 * - Enforces hourly AI usage per user
 * - Attaches tier limits to req.aiLimits
 */
function aiRateLimiter(req, res, next) {
    try {
        // Auth middleware MUST run before this
        const user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized AI request'
            });
        }

        const userId = user._id.toString();
        const tier = user.tier && AI_LIMITS[user.tier]
            ? user.tier
            : 'free';

        const limits = AI_LIMITS[tier];
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour

        let usage = aiUsageStore.get(userId);

        // Initialize or reset usage window
        if (!usage || now > usage.resetAt) {
            usage = {
                count: 0,
                resetAt: now + windowMs
            };
        }

        // Enforce call limit
        if (usage.count >= limits.callsPerHour) {
            return res.status(429).json({
                success: false,
                error: 'AI usage limit reached for this hour',
                meta: {
                    tier,
                    limit: limits.callsPerHour,
                    resetAt: new Date(usage.resetAt).toISOString()
                }
            });
        }

        // Increment usage
        usage.count += 1;
        aiUsageStore.set(userId, usage);

        // Attach limits + usage info for downstream logic
        req.aiLimits = {
            tier,
            maxInputChars: limits.maxInputChars,
            maxOutputTokens: limits.maxOutputTokens,
            callsPerHour: limits.callsPerHour
        };

        req.aiUsage = {
            used: usage.count,
            remaining: limits.callsPerHour - usage.count,
            resetAt: usage.resetAt
        };

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'AI rate limiter internal error'
        });
    }
}

module.exports = aiRateLimiter;