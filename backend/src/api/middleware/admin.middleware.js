// backend/src/api/middleware/admin.middleware.js
const AuditLog = require('../../models/AuditLog');

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Check for admin role
        if (req.user.role !== 'admin') {
            await AuditLog.log({
                action: 'admin.access_denied',
                severity: 'warning',
                userId: req.user._id,
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    path: req.originalUrl
                },
                result: 'failure'
            });
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        return next();
    } catch (e) {
        console.error('Admin middleware error:', e);
        return res.status(500).json({ success: false, error: 'Access check failed' });
    }
};

module.exports = { requireAdmin };
