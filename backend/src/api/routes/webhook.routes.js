// ============================================
// src/api/routes/webhook.routes.js
// ============================================

const express = require('express');
const router = express.Router();

const WebhookController = require('../controllers/WebhookController');

// Safety wrapper
const safe = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`Missing or invalid handler: ${name}`);
  }
  return fn;
};

// Stripe webhook (raw body required)
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  safe(WebhookController.handleStripe, 'handleStripe')
);

module.exports = router;