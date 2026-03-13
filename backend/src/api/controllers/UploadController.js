// backend/src/api/controllers/UploadController.js
const { v4: uuidv4 } = require('uuid');
const StorageService = require('../../services/storage/StorageService');
const logger = require('../../utils/logger');

class UploadController {
  /**
   * Direct file upload
   */
  async uploadFile(req, res, next) {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Validate file
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Only PDF files are allowed'
        });
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File size must be less than 10MB'
        });
      }

      const fileId = uuidv4();
      
      // Upload to storage
      const result = await StorageService.uploadFile(file.buffer, {
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        jobId: fileId,
        userId: req.user?._id?.toString()
      });

      logger.info(`File uploaded: ${fileId} - ${file.originalname}`);

      res.json({
        success: true,
        data: {
          fileId: fileId,
          filename: file.originalname,
          size: file.size,
          storageKey: result.storageKey,
          url: result.location,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('File upload failed:', error);
      next(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(req, res, next) {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Validate image
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File size must be less than 5MB'
        });
      }

      const avatarId = `avatar_${req.user._id}`;
      
      // Upload to storage
      const result = await StorageService.uploadFile(file.buffer, {
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        jobId: avatarId,
        userId: req.user._id.toString()
      });

      logger.info(`Avatar uploaded for user ${req.user._id}`);

      res.json({
        success: true,
        data: {
          avatarUrl: result.location,
          message: 'Avatar uploaded successfully'
        }
      });
    } catch (error) {
      logger.error('Avatar upload failed:', error);
      next(error);
    }
  }

  /**
   * Check upload status
   */
  async checkUploadStatus(req, res, next) {
    try {
      const { fileId } = req.params;
      
      // In a real app, you would check the processing status
      // For now, return a mock status
      res.json({
        success: true,
        data: {
          fileId,
          status: 'completed',
          processedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Upload status check failed:', error);
      next(error);
    }
  }
}

module.exports = new UploadController();