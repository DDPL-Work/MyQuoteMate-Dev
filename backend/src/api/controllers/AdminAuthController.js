// backend/src/api/controllers/AdminAuthController.js
const Admin = require('../../models/Admin');
const TokenService = require('../../services/auth/TokenService');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

class AdminAuthController {
    /**
     * Register new Admin
     * POST /api/v1/admin/auth/register
     */
    static async register(req, res, next) {
        try {
            const { email, password, firstName, lastName, secretCode } = req.body;

            // Basic security check: Require a secret code to register as admin
            const ADMIN_REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'MyQuoteMate@12345!';
            if (secretCode !== ADMIN_REGISTRATION_SECRET) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized: Invalid registration secret code'
                });
            }

            // Check if admin exists
            const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already registered'
                });
            }

            // Create admin
            const admin = await Admin.create({
                email: email.toLowerCase(),
                passwordHash: password,
                firstName,
                lastName
            });

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(admin._id);
            const refreshToken = TokenService.generateRefreshToken(admin._id);

            // Audit log
            await AuditLog.log({
                userId: admin._id,
                action: 'admin.register',
                resourceType: 'admin',
                resourceId: admin._id.toString(),
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                }
            });

            logger.info(`Admin registered: ${admin.email}`);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: admin._id,
                        email: admin.email,
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        role: admin.role
                    },
                    tokens: {
                        accessToken,
                        refreshToken,
                        expiresIn: process.env.JWT_EXPIRES_IN
                    }
                }
            });
        } catch (error) {
            logger.error('Admin registration failed:', error);
            next(error);
        }
    }

    /**
     * Login Admin
     * POST /api/v1/admin/auth/login
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

            // Fail fast when DB is unavailable to avoid buffering timeout -> 500
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Authentication service temporarily unavailable'
                });
            }

            if (!normalizedEmail || typeof password !== 'string' || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            // Find admin
            const admin = await Admin.findOne({ email: normalizedEmail }).select('+passwordHash');

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            if (admin.accountStatus !== 'active') {
                return res.status(403).json({
                    success: false,
                    error: 'Account is suspended'
                });
            }

            // Verify password
            let isPasswordValid = false;
            try {
                isPasswordValid = await admin.comparePassword(password);
            } catch (passwordError) {
                logger.warn('Admin password comparison failed', {
                    email: normalizedEmail,
                    message: passwordError.message
                });
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Update last login without validating full legacy document shape
            await Admin.updateOne(
                { _id: admin._id },
                { $set: { lastLoginAt: new Date() } }
            );

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(admin._id);
            const refreshToken = TokenService.generateRefreshToken(admin._id);

            // Audit log
            await AuditLog.log({
                userId: admin._id,
                action: 'admin.login',
                resourceType: 'admin',
                resourceId: admin._id.toString(),
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                }
            });

            logger.info(`Admin logged in: ${admin.email}`);

            res.json({
                success: true,
                data: {
                    user: {
                        id: admin._id,
                        email: admin.email,
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        role: admin.role
                    },
                    tokens: {
                        accessToken,
                        refreshToken,
                        expiresIn: process.env.JWT_EXPIRES_IN
                    }
                }
            });
        } catch (error) {
            logger.error('Admin login failed:', error);
            next(error);
        }
    }

    /**
     * Refresh Admin token
     * POST /api/v1/admin/auth/refresh
     */
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = TokenService.verifyRefreshToken(refreshToken);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired refresh token'
                });
            }

            // Find admin
            const admin = await Admin.findById(decoded.userId);

            if (!admin || admin.accountStatus !== 'active') {
                return res.status(401).json({
                    success: false,
                    error: 'Admin not found or inactive'
                });
            }

            // Generate new tokens
            const newAccessToken = TokenService.generateAccessToken(admin._id);
            const newRefreshToken = TokenService.generateRefreshToken(admin._id);

            res.json({
                success: true,
                data: {
                    tokens: {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                        expiresIn: process.env.JWT_EXPIRES_IN
                    }
                }
            });
        } catch (error) {
            logger.error('Admin token refresh failed:', error);
            next(error);
        }
    }
}

module.exports = AdminAuthController;
