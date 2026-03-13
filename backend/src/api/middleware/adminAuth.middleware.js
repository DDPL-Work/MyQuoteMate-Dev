// backend/src/api/middleware/adminAuth.middleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const logger = require('../../utils/logger');

/**
 * Verify JWT token and attach admin to request
 */
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies?.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Specifically search in the Admin model
        const admin = await Admin.findById(decoded.userId);

        if (!admin || admin.accountStatus !== 'active') {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired admin token'
            });
        }

        req.user = admin;
        req.isAdmin = true;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        logger.error('Admin authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

module.exports = { authenticateAdmin };
