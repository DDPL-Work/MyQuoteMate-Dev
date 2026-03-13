// backend/src/api/routes/avatar.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const UserController = require('../controllers/UserController');
const s3Service = require('../../services/storage/StorageService');
const logger = require('../../utils/logger');

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

/**
 * Upload avatar
 * POST /api/v1/avatar
 */
router.post(
  '/',
  authMiddleware.authenticate,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const fileId = uuidv4();
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const filename = `avatar-${fileId}${fileExtension}`;

      // Upload to S3
      const result = await s3Service.uploadFile(req.file.buffer, {
        filename: filename,
        mimeType: req.file.mimetype,
        folder: 'avatars',
        userId: req.user._id.toString()
      });

      logger.info(`Avatar uploaded for user ${req.user._id}: ${filename}`);

      // Update user record with avatar URL
      const avatarUrl = result.url || `${process.env.STORAGE_BASE_URL}/avatars/${filename}`;
      
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatarUrl },
        { new: true }
      ).select('-passwordHash');

      res.json({
        success: true,
        data: {
          avatarUrl: avatarUrl,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl
          },
          message: 'Avatar uploaded successfully'
        }
      });
    } catch (error) {
      logger.error('Avatar upload failed:', error);
      next(error);
    }
  }
);

/**
 * Remove avatar
 * DELETE /api/v1/avatar
 */
router.delete(
  '/',
  authMiddleware.authenticate,
  async (req, res, next) => {
    try {
      // Get current avatar URL to delete from storage
      const user = await User.findById(req.user._id);
      
      if (user.avatarUrl) {
        // Extract filename from URL
        const filename = user.avatarUrl.split('/').pop();
        
        // Delete from S3
        try {
          await s3Service.deleteFile(`avatars/${filename}`);
        } catch (storageError) {
          logger.warn('Failed to delete avatar from storage:', storageError);
          // Continue anyway - we still want to update the database
        }
      }

      // Remove avatar URL from user record
      await User.findByIdAndUpdate(req.user._id, { $unset: { avatarUrl: 1 } });

      res.json({
        success: true,
        data: {
          message: 'Avatar removed successfully'
        }
      });
    } catch (error) {
      logger.error('Avatar removal failed:', error);
      next(error);
    }
  }
);

module.exports = router;