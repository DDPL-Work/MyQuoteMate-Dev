const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

const AuthController = require('../controllers/AuthController');
const OAuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rateLimit.middleware');

// Public routes
router.post(
  '/register',
  rateLimitMiddleware.authLimiter,
  validationMiddleware.validateRegistration,
  AuthController.register
);

router.post(
  '/login',
  rateLimitMiddleware.authLimiter,
  validationMiddleware.validateLogin,
  AuthController.login
);

router.post(
  '/refresh',
  AuthController.refresh
);

router.post(
  '/forgot-password',
  rateLimitMiddleware.strictLimiter,
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  rateLimitMiddleware.strictLimiter,
  AuthController.resetPassword
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }),
  OAuthController.googleCallback
);

// Email verification routes
router.post('/send-verification',
  authMiddleware.authenticate,
  OAuthController.sendVerificationEmail
);

router.post('/verify-email',
  OAuthController.verifyEmail
);

// OTP routes
router.post('/send-otp',
  rateLimitMiddleware.authLimiter,
  AuthController.sendOtp
);

router.post('/verify-otp',
  rateLimitMiddleware.authLimiter,
  AuthController.verifyOtp
);

// Protected routes
router.post(
  '/logout',
  authMiddleware.authenticate,
  AuthController.logout
);

router.get(
  '/me',
  authMiddleware.authenticate,
  AuthController.getMe
);

module.exports = router;

// REMOVE EVERYTHING AFTER THIS LINE - NO AuthController CLASS HERE