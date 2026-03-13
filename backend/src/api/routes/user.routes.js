// backend/src/api/routes/user.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth.middleware');

// Configure multer for avatar upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// All user routes require authentication
router.use(authMiddleware.authenticate);

// Profile endpoints
router.get('/me', UserController.getProfile);
router.put('/me', UserController.updateProfile);

// Password management
router.put('/me/password', UserController.changePassword);

// Avatar management
router.post('/me/avatar', upload.single('avatar'), UserController.uploadAvatar);
router.delete('/me/avatar', UserController.removeAvatar);

// Preferences
router.get('/me/preferences', (req, res) => {
  res.json({
    success: true,
    data: req.user.preferences
  });
});
router.put('/me/preferences', UserController.updatePreferences);

// Security
router.get('/me/security', UserController.getSecuritySettings);
router.put('/me/security/two-factor', UserController.toggleTwoFactor);

// Subscription
router.get('/me/subscription', UserController.getSubscription);
router.put('/me/subscription', UserController.updateSubscription);

// Statistics
router.get('/me/stats', UserController.getStats);

// Account management
router.delete('/me', UserController.deleteAccount);

module.exports = router;