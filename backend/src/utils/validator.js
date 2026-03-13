// ============================================
// src/utils/validator.js
// ============================================
class Validator {
  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password) {
    // Min 8 chars, at least one uppercase, one lowercase, one number, one special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate Australian phone number
   */
  static isValidAustralianPhone(phone) {
    const phoneRegex = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate ABN
   */
  static isValidABN(abn) {
    // Remove spaces
    abn = abn.replace(/\s/g, '');

    if (abn.length !== 11 || !/^\d+$/.test(abn)) {
      return false;
    }

    // Calculate checksum
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let sum = 0;

    for (let i = 0; i < 11; i++) {
      let digit = parseInt(abn.charAt(i));
      if (i === 0) digit -= 1;
      sum += digit * weights[i];
    }

    return sum % 89 === 0;
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255);
  }

  /**
   * Validate tier
   */
  static isValidTier(tier) {
    return ['free', 'standard', 'premium'].includes(tier);
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

module.exports = Validator;