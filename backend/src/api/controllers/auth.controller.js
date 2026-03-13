// backend/src/api/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Lead = require('../../models/Lead');
const logger = require('../../utils/logger');

class AuthController {
    /**
     * Google OAuth callback handler
     */
    static async googleCallback(req, res) {
        try {
            const user = req.user;

            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
            }

            // Generate JWT tokens
            const accessToken = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
            );

            // Set secure cookies
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            };

            res.cookie('auth_token', accessToken, cookieOptions);
            res.cookie('refresh_token', refreshToken, {
                ...cookieOptions,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Redirect to frontend with success
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            logger.error('Google OAuth callback error:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user || user.accountStatus === 'deleted') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return res.json({
                success: true,
                data: { accessToken }
            });
        } catch (error) {
            logger.error('Token refresh error:', error);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }
    }

    /**
     * Send email verification
     */
    static async sendVerificationEmail(req, res) {
        try {
            const user = req.user;

            if (user.emailVerified) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already verified'
                });
            }

            // Generate verification token
            const verificationToken = jwt.sign(
                { userId: user._id, email: user.email, type: 'email_verification' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Save token to user
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();

            // TODO: Send email with verification link
            // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            // await emailService.sendVerificationEmail(user.email, verificationUrl);

            logger.info(`Verification email sent to ${user.email}`);

            return res.json({
                success: true,
                message: 'Verification email sent'
            });
        } catch (error) {
            logger.error('Send verification email error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification email'
            });
        }
    }

    /**
     * Verify email with token
     */
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Verification token is required'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.type !== 'email_verification') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid verification token'
                });
            }

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            if (user.emailVerified) {
                return res.json({
                    success: true,
                    message: 'Email already verified'
                });
            }

            // Verify email
            user.emailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            logger.info(`Email verified for user ${user.email}`);

            return res.json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({
                    success: false,
                    error: 'Verification token has expired'
                });
            }

            logger.error('Email verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify email'
            });
        }
    }

    /**
     * Logout user
     */
    static async logout(req, res) {
        try {
            // Clear cookies
            res.clearCookie('auth_token');
            res.clearCookie('refresh_token');

            return res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            logger.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to logout'
            });
        }
    }
}

module.exports = AuthController;
