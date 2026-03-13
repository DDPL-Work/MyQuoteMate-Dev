const nodemailer = require('nodemailer');
const emailConfig = require('../../config/email');
const logger = require('../../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465, // true for 465, false for other ports
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      // Don't throw error to prevent blocking main flow, just log it
      return null;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to MyQuoteMate!';
    const html = `
      <h1>Welcome, ${user.firstName || 'User'}!</h1>
      <p>Thank you for joining MyQuoteMate. We are excited to help you analyze your quotes.</p>
      <p>Your account is now active with the <strong>${user.subscription.plan}</strong> tier.</p>
      <a href="http://localhost:5173/upload">Upload your first quote</a>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  async sendPaymentReceiptEmail(user, payment) {
    const subject = 'Payment Receipt - MyQuoteMate';
    const html = `
      <h1>Payment Successful</h1>
      <p>Hi ${user.firstName || 'there'},</p>
      <p>We received your payment of <strong>$${payment.amount / 100}</strong>.</p>
      <p>You have purchased: <strong>${payment.tier.toUpperCase()} Report(s)</strong>.</p>
      <p>Credits added: ${payment.tier === 'Premium' ? 3 : 1}</p>
      <p>Transaction ID: ${payment._id}</p>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  async sendJobCompletionEmail(user, job) {
    const subject = 'Your Quote Analysis is Ready!';
    const html = `
      <h1>Analysis Complete</h1>
      <p>Good news! Your quote analysis for <strong>${job.metadata?.title || 'your document'}</strong> is ready.</p>
      <p>Tier Used: <strong>${job.tier}</strong></p>
      <a href="http://localhost:5173/check-quote">View Analysis</a>
    `;
    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();