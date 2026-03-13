// ============================================
// src/config/stripe.js
// ============================================
module.exports = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  prices: {
    standard: process.env.STRIPE_PRICE_STANDARD,
    premium: process.env.STRIPE_PRICE_PREMIUM
  },
  amounts: {
    standard: 2900, // $29.00 AUD
    premium: 4900   // $49.00 AUD
  },
  currency: 'aud'
};