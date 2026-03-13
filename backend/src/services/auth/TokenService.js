// backend/src/services/auth/TokenService.js
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

class TokenService {
  /**
   * Generate access token (short-lived)
   * @param {string} userId - User ID
   * @returns {string} JWT access token
   */
  static generateAccessToken(userId) {
    try {
      const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
          issuer: 'myquotemate',
          subject: userId.toString()
        }
      );
      return token;
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw error;
    }
  }

  /**
   * Generate refresh token (long-lived)
   * @param {string} userId - User ID
   * @returns {string} JWT refresh token
   */
  static generateRefreshToken(userId) {
    try {
      const token = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          issuer: 'myquotemate',
          subject: userId.toString()
        }
      );
      return token;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw error;
    }
  }

  /**
   * Verify access token
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key',
        {
          issuer: 'myquotemate'
        }
      );
      return decoded;
    } catch (error) {
      logger.error('Error verifying access token:', error.message);
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        {
          issuer: 'myquotemate'
        }
      );
      return decoded;
    } catch (error) {
      logger.error('Error verifying refresh token:', error.message);
      return null;
    }
  }

  /**
   * Decode token without verification (for inspection)
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding token:', error.message);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string} Token without "Bearer " prefix
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    
    return null;
  }
}

module.exports = TokenService;