// ============================================
// src/utils/retry.js
// ============================================
const logger = require('./logger');

class RetryHelper {
  /**
   * Retry function with exponential backoff
   */
  static async withRetry(fn, options = {}) {
    const {
      retries = 3,
      delay = 1000,
      backoff = 2,
      onRetry = null
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === retries) {
          logger.error(`Max retries (${retries}) reached`, { error: error.message });
          throw error;
        }

        const waitTime = delay * Math.pow(backoff, attempt - 1);
        logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms`, {
          error: error.message
        });

        if (onRetry) {
          onRetry(attempt, error);
        }

        await this.sleep(waitTime);
      }
    }

    throw lastError;
  }

  /**
   * Sleep helper
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RetryHelper;