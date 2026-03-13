// ============================================
// src/workers/processors/emailProcessor.js
// ============================================
const EmailService = require('../../services/email/EmailService');
const logger = require('../../utils/logger');

class EmailProcessor {
  async process(job) {
    const { to, template, data } = job.data;

    try {
      logger.info(`Sending email to ${to} with template ${template}`);

      switch (template) {
        case 'free_complete':
        case 'paid_complete':
          await EmailService.sendAnalysisComplete(to, data);
          break;

        case 'payment_confirmation':
          await EmailService.sendPaymentConfirmation(to, data);
          break;

        case 'password_reset':
          await EmailService.sendPasswordReset(to, data.resetToken);
          break;

        default:
          logger.warn(`Unknown email template: ${template}`);
      }

      logger.info(`Email sent successfully to ${to}`);

      return { success: true };
    } catch (error) {
      logger.error(`Email sending failed for ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailProcessor();