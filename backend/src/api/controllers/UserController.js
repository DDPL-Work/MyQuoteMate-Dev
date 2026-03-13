// backend/src/api/controllers/UserController.js
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');
const StorageService = require('../../services/storage/StorageService');

class UserController {
  // Get current user profile - COMPLETE VERSION
  async getProfile(req, res, next) {
    try {
      // Fetch user with all necessary fields
      const user = await User.findById(req.user._id).select('-passwordHash');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl,
        subscription: user.subscription,
        preferences: user.preferences,
        security: user.security,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      logger.error('Get profile failed:', error);
      next(error);
    }
  }

  // Update profile - COMPLETE VERSION
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone, address } = req.body;

      // Validate inputs
      const updates = {};
      if (firstName !== undefined) {
        if (firstName.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'First name must be at least 2 characters'
          });
        }
        updates.firstName = firstName.trim();
      }

      if (lastName !== undefined) {
        if (lastName.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Last name must be at least 2 characters'
          });
        }
        updates.lastName = lastName.trim();
      }

      if (phone !== undefined) updates.phone = phone.trim();
      if (address !== undefined) updates.address = address.trim();

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-passwordHash');

      // Log the update
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.profile_update',
        resourceType: 'user',
        resourceId: req.user._id.toString(),
        metadata: updates
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl
          },
          message: 'Profile updated successfully'
        }
      });
    } catch (error) {
      logger.error('Update profile failed:', error);
      next(error);
    }
  }

  // Change password - COMPLETE VERSION
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate inputs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters long'
        });
      }

      // Get user with password hash
      const user = await User.findById(req.user._id).select('+passwordHash');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        await user.incLoginAttempts();

        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Reset login attempts on successful verification
      await user.resetLoginAttempts();

      // Update password
      user.passwordHash = newPassword;
      await user.save();

      // Log the password change
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.password_change',
        resourceType: 'user',
        resourceId: req.user._id.toString()
      });

      res.json({
        success: true,
        data: {
          message: 'Password updated successfully'
        }
      });
    } catch (error) {
      logger.error('Change password failed:', error);
      next(error);
    }
  }

  // User statistics - ENHANCED VERSION
  async getStats(req, res, next) {
    try {
      // You can add actual counts from other collections here
      const stats = {
        accountCreatedAt: req.user.createdAt,
        lastLoginAt: req.user.security?.lastLoginAt,
        subscription: req.user.subscription,
        reportsUsed: req.user.subscription?.reportsUsed || 0,
        reportsRemaining: (req.user.subscription?.reportsTotal || 3) - (req.user.subscription?.reportsUsed || 0),
        plan: req.user.subscription?.plan || 'Free',
        accountStatus: req.user.accountStatus
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get stats failed:', error);
      next(error);
    }
  }

  // Delete account (soft delete) - ENHANCED VERSION
  async deleteAccount(req, res, next) {
    try {
      const { confirmPassword } = req.body;

      if (!confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please confirm your password to delete account'
        });
      }

      // Get user with password hash for verification
      const user = await User.findById(req.user._id).select('+passwordHash');

      // Verify password
      const isValid = await user.comparePassword(confirmPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password is incorrect'
        });
      }

      // Soft delete the account
      await user.softDelete();

      // Log the deletion
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.delete',
        resourceType: 'user',
        resourceId: req.user._id.toString()
      });

      res.json({
        success: true,
        data: {
          message: 'Account deleted successfully'
        }
      });
    } catch (error) {
      logger.error('Delete account failed:', error);
      next(error);
    }
  }

  // NEW: Upload avatar
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
        });
      }

      // Validate file size (5MB max)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File size must be less than 5MB'
        });
      }

      // Upload to storage
      const result = await StorageService.uploadFile(req.file.buffer, {
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        jobId: `avatar_${req.user._id}`,
        userId: req.user._id.toString()
      });

      // Update user with avatar URL
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatarUrl: result.location },
        { new: true }
      ).select('-passwordHash');

      // Log the upload
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.avatar_upload',
        resourceType: 'user',
        resourceId: req.user._id.toString(),
        metadata: {
          filename: req.file.originalname,
          size: req.file.size
        }
      });

      res.json({
        success: true,
        avatarUrl: result.location,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl
          }
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      logger.error('Upload avatar failed:', error);
      next(error);
    }
  }

  // NEW: Remove avatar
  async removeAvatar(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      if (!user.avatarUrl) {
        return res.status(400).json({
          success: false,
          error: 'No avatar to remove'
        });
      }

      // Try to delete from storage
      try {
        // Extract storage key from URL
        if (user.avatarUrl.includes('cloudinary.com')) {
          const parts = user.avatarUrl.split('/');
          const publicId = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
          await StorageService.deleteFile(publicId);
        }
      } catch (storageError) {
        logger.warn('Failed to delete avatar from storage:', storageError);
        // Continue anyway - we still want to remove the reference
      }

      // Remove avatar URL from user
      user.avatarUrl = undefined;
      await user.save();

      // Log the removal
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.avatar_remove',
        resourceType: 'user',
        resourceId: req.user._id.toString()
      });

      res.json({
        success: true,
        data: {
          message: 'Avatar removed successfully'
        }
      });
    } catch (error) {
      logger.error('Remove avatar failed:', error);
      next(error);
    }
  }

  // NEW: Update preferences
  async updatePreferences(req, res, next) {
    try {
      const { email, reportReady, promotional, reminders } = req.body;

      const updates = {};
      if (email !== undefined) updates['preferences.email'] = Boolean(email);
      if (reportReady !== undefined) updates['preferences.reportReady'] = Boolean(reportReady);
      if (promotional !== undefined) updates['preferences.promotional'] = Boolean(promotional);
      if (reminders !== undefined) updates['preferences.reminders'] = Boolean(reminders);

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select('-passwordHash');

      // Log the update
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.preferences_update',
        resourceType: 'user',
        resourceId: req.user._id.toString(),
        metadata: updates
      });

      res.json({
        success: true,
        data: {
          preferences: user.preferences,
          message: 'Preferences updated successfully'
        }
      });
    } catch (error) {
      logger.error('Update preferences failed:', error);
      next(error);
    }
  }

  // NEW: Get security settings
  async getSecuritySettings(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('security loginAttempts lockUntil');

      res.json({
        success: true,
        data: {
          twoFactorEnabled: user.security?.twoFactorEnabled || false,
          lastLoginAt: user.security?.lastLoginAt,
          loginAttempts: user.loginAttempts,
          isLocked: user.isLocked,
          lockUntil: user.lockUntil
        }
      });
    } catch (error) {
      logger.error('Get security settings failed:', error);
      next(error);
    }
  }

  // NEW: Toggle two-factor authentication
  async toggleTwoFactor(req, res, next) {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Enabled flag is required and must be boolean'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 'security.twoFactorEnabled': enabled },
        { new: true }
      );

      // Log the change
      await AuditLog.log({
        userId: req.user._id,
        action: enabled ? 'user.2fa_enable' : 'user.2fa_disable',
        resourceType: 'user',
        resourceId: req.user._id.toString()
      });

      res.json({
        success: true,
        data: {
          twoFactorEnabled: user.security.twoFactorEnabled,
          message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`
        }
      });
    } catch (error) {
      logger.error('Toggle two-factor failed:', error);
      next(error);
    }
  }

  // NEW: Update subscription
  async updateSubscription(req, res, next) {
    try {
      const { plan } = req.body;

      if (!['Free', 'Standard', 'Premium'].includes(plan)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan selected'
        });
      }

      const subscriptionUpdate = {
        'subscription.plan': plan,
        'subscription.reportsTotal': plan === 'Free' ? 3 : plan === 'Standard' ? 10 : 50
      };

      // Set expiration for paid plans
      if (plan !== 'Free') {
        subscriptionUpdate['subscription.expiresAt'] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        subscriptionUpdate['subscription.status'] = 'active';
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        subscriptionUpdate,
        { new: true }
      ).select('-passwordHash');

      // Log the subscription change
      await AuditLog.log({
        userId: req.user._id,
        action: 'user.subscription_update',
        resourceType: 'user',
        resourceId: req.user._id.toString(),
        metadata: { plan }
      });

      res.json({
        success: true,
        data: {
          subscription: user.subscription,
          message: 'Subscription updated successfully'
        }
      });
    } catch (error) {
      logger.error('Update subscription failed:', error);
      next(error);
    }
  }

  // NEW: Get subscription info
  async getSubscription(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('subscription');

      res.json({
        success: true,
        data: user.subscription
      });
    } catch (error) {
      logger.error('Get subscription failed:', error);
      next(error);
    }
  }
}

module.exports = new UserController();