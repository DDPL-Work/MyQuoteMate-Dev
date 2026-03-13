// ============================================
// src/api/controllers/WebhookController.js
// ============================================

const stripeService = require('../../services/payment/StripeService');
const logger = require('../../utils/logger');

class WebhookController {
  async handleStripe(req, res) {
    try {
      await stripeService.handleWebhook(req);
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Stripe webhook failed:', error);
      res.status(400).json({ error: 'Webhook Error' });
    }
  }
}

module.exports = new WebhookController();
