// backend/src/api/routes/upload.routes.js - SIMPLIFIED
const express = require('express');
const router = express.Router();
const multer = require('multer');
const UploadController = require('../controllers/UploadController');
const authMiddleware = require('../middleware/auth.middleware');

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

// PDF upload
const pdfUpload = upload.single('file');

// Image upload (for avatars)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('avatar');

// Upload PDF
router.post(
  '/',
  authMiddleware.optionalAuth,
  pdfUpload,
  UploadController.uploadFile
);

// Upload avatar
router.post(
  '/avatar',
  authMiddleware.authenticate,
  imageUpload,
  UploadController.uploadAvatar
);

// Check upload status
router.get(
  '/:fileId/status',
  authMiddleware.optionalAuth,
  UploadController.checkUploadStatus
);

module.exports = router;