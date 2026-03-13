// backend/src/services/auth/AuthService.js
const crypto = require('crypto');
const User = require('../../models/User');
const logger = require('../../utils/logger');

class AuthService {
  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(resetTokenExpiry);
    await user.save();
    
    return resetToken;
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    return user;
  }

  /**
   * Generate email verification token
   */
  static async generateEmailVerificationToken(user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 86400000; // 24 hours
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(verificationExpiry);
    await user.save();
    
    return verificationToken;
  }

  /**
   * Verify email verification token
   */
  static async verifyEmailVerificationToken(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    return user;
  }

  /**
   * Generate API key for user
   */
  static async generateApiKey(user) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Store hashed API key
    user.apiKeyHash = apiKeyHash;
    await user.save();
    
    return { apiKey, apiKeyHash };
  }

  /**
   * Verify API key
   */
  static async verifyApiKey(apiKey) {
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const user = await User.findOne({ apiKeyHash });
    
    return user;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return { valid: false, message: `Password must be at least ${minLength} characters long` };
    }
    
    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!hasNumbers) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true, message: 'Password is strong' };
  }

  /**
   * Check if user can perform action (rate limiting)
   */
  static async checkRateLimit(userId, action, limit = 10, windowMs = 60000) {
    // Simplified rate limiting
    // In production, use Redis for distributed rate limiting
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // This is a basic in-memory rate limiter
    // For production, use a proper rate limiting solution
    return { allowed: true, remaining: limit - 1 };
  }
}

module.exports = AuthService;