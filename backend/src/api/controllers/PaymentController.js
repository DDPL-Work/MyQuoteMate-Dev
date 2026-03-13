// ============================================
// src/api/controllers/paymentController.js
// ============================================
const stripeService = require('../../services/payment/StripeService');
const Payment = require('../../models/Payment');
const Job = require('../../models/Job');
const logger = require('../../utils/logger');

class PaymentController {
  /**
   * Create payment intent
   * POST /api/v1/payments/create-intent
   */
  async createPaymentIntent(req, res, next) {
    try {
      const { jobId, tier, customerData } = req.body;

      // Validate tier (Case-insensitive check, but we'll use capitalized for the model)
      const validTiers = ['Standard', 'Premium'];
      const normalizedTier = validTiers.find(t => t.toLowerCase() === tier?.toLowerCase());

      if (!normalizedTier) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tier. Must be Standard or Premium.'
        });
      }

      // Find job if jobId is provided
      let job = null;
      if (jobId) {
        job = await Job.findOne({ jobId });

        if (!job) {
          return res.status(404).json({
            success: false,
            error: 'Job not found'
          });
        }

        // Check if already paid
        if (job.unlocked) {
          return res.status(400).json({
            success: false,
            error: 'Job is already unlocked'
          });
        }

        // Check if job is completed
        if (job.status !== 'completed') {
          return res.status(400).json({
            success: false,
            error: 'Job analysis not yet complete'
          });
        }
      }

      // Enforce Strict Single Tier Policy
      const User = require('../../models/User');
      const user = await User.findById(req.user?._id);

      if (user && user.subscription && user.subscription.plan !== 'Free') {
        if (user.subscription.credits > 0) {
          return res.status(403).json({
            success: false,
            error: `You already have an active ${user.subscription.plan} plan with ${user.subscription.credits} unused reports. Please use your existing credits first.`
          });
        }
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        job,
        normalizedTier,
        {
          ...customerData,
          userId: req.user?._id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      res.status(200).json({
        success: true,
        data: paymentIntent
      });

    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      next(error);
    }
  }

  /**
   * Verify Payment Manually (Sync)
   * POST /api/v1/payments/verify
   */
  async verifyPayment(req, res, next) {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ success: false, error: 'Payment Intent ID is required' });
      }

      // Retrieve from Stripe
      const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

      if (!paymentIntent) {
        return res.status(404).json({ success: false, error: 'Payment Intent not found' });
      }

      if (paymentIntent.status === 'succeeded') {
        // Force fulfillment (idempotent)
        await stripeService.fulfillOrder(paymentIntent);

        // Fetch updated user to return fresh stats
        const User = require('../../models/User');
        const updatedUser = await User.findById(req.user._id);

        logger.info(`Manual Verification - Updated User Stats: ID=${req.user._id}, Credits=${updatedUser.subscription.credits}, Plan=${updatedUser.subscription.plan}`);

        return res.json({
          success: true,
          message: 'Payment verified and processed',
          status: 'succeeded',
          data: {
            credits: updatedUser.subscription.credits,
            plan: updatedUser.subscription.plan,
            reportsUsed: updatedUser.subscription.reportsUsed
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: `Payment is not succeeded. Status: ${paymentIntent.status}`,
          status: paymentIntent.status
        });
      }

    } catch (error) {
      logger.error('Manual validation failed:', error);
      next(error);
    }
  }

  /**
   * Handle Stripe webhook
   * POST /api/v1/payments/webhook
   */
  async handleWebhook(req, res, next) {
    try {
      await stripeService.handleWebhook(req);

      res.status(200).json({ received: true });

    } catch (error) {
      logger.error('Webhook handling failed:', error);
      res.status(400).json({
        success: false,
        error: 'Webhook Error'
      });
    }
  }

  /**
   * Get payment details
   * GET /api/v1/payments/:paymentId
   */
  async getPayment(req, res, next) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findById(paymentId)
        .populate('jobId', 'jobId tier status');

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Check ownership
      if (payment.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          tier: payment.tier,
          jobId: payment.jobId?.jobId,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt
        }
      });

    } catch (error) {
      logger.error('Failed to fetch payment:', error);
      next(error);
    }
  }

  /**
   * Get user payments
   * GET /api/v1/payments
   */
  async getUserPayments(req, res, next) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const payments = await Payment.find({
        userId: req.user._id
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .populate('jobId', 'jobId tier');

      const total = await Payment.countDocuments({
        userId: req.user._id
      });

      res.json({
        success: true,
        data: {
          payments: payments.map(p => ({
            id: p._id,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            tier: p.tier,
            jobId: p.jobId?.jobId,
            createdAt: p.createdAt,
            paidAt: p.paidAt
          })),
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: offset + payments.length < total
          }
        }
      });

    } catch (error) {
      logger.error('Failed to fetch user payments:', error);
      next(error);
    }
  }

  /**
   * Mock Upgrade (DEV ONLY)
   * POST /api/v1/payments/mock-upgrade
   */
  async mockUpgrade(req, res, next) {
    try {
      const { tier } = req.body;
      const User = require('../../models/User'); // Lazy load to avoid circular deps if any

      if (!['Free', 'Standard', 'Premium'].includes(tier)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tier'
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Enforce Strict Single Tier Policy
      if (user.subscription && user.subscription.plan !== 'Free') {
        if (user.subscription.credits > 0) {
          return res.status(403).json({
            success: false,
            error: `You already have an active ${user.subscription.plan} plan with ${user.subscription.credits} unused reports. Please use your existing credits first.`
          });
        }
      }

      // Update subscription / Credits
      let creditsToAdd = 0;
      if (tier === 'Standard') {
        creditsToAdd = 1;
        // RESET usage for Standard (Pay-per-report model)
        // User gets exactly 1 report capacity total
        user.subscription.credits = 1;
        user.subscription.reportsTotal = 1;
        user.subscription.reportsUsed = 0;
      } else if (tier === 'Premium') {
        creditsToAdd = 3; // "3 Reports per Buy"
        // Accumulate or Reset? User wanted limitation.
        // Let's treat Premium as a pack for now, but ensure it's set correctly.
        // Typically Premium might be a subscription, but mock treats it as credits.
        user.subscription.credits = (user.subscription.credits || 0) + creditsToAdd;
        user.subscription.reportsTotal = (user.subscription.reportsTotal || 0) + creditsToAdd;
        // Don't reset reportsUsed if accumulating, but if new cycle, maybe?
        // Let's leave Premium accumulation as is for now, or strictly set it if desired.
        // Safest is to accumulate for Premium, but strictly set Standard.

        // Actually, let's keep it simple: Add credits, but update Total to reflect CURRENT potential?
        // No, reportsTotal is usually "Limit". 
        // If I have 1 credit left and buy 3, I have 4.
      }

      // Special handling for Standard to enforce "Single Use" feel
      if (tier !== 'Standard') {
        // Existing logic for non-Standard (accummulation) which I already handled above for Premium
      }

      // Update tier only if upgrading to a higher tier or stay in Premium
      const tierLevels = { 'Free': 0, 'Standard': 1, 'Premium': 2 };
      const currentTier = user.subscription.plan || 'Free';

      if (tierLevels[tier] > tierLevels[currentTier] || tier === 'Premium') {
        user.subscription.plan = tier;
      }

      user.subscription.status = 'active';
      user.subscription.currentPeriodStart = new Date();
      // user.subscription.currentPeriodEnd = ... (No expiry for credits, usually)

      await user.save();

      // Log the mock payment
      const stripeService = require('../../services/payment/StripeService');
      const amount = (tier === 'Standard' ? 7.99 : 9.99);

      const payment = new Payment({
        userId: user._id,
        amount: amount,
        currency: 'AUD',
        status: 'succeeded',
        provider: 'stripe', // Mocking stripe
        stripePaymentIntentId: 'mock_pi_' + Date.now(),
        tier: tier, // Already 'Standard' or 'Premium' from the check above
        receiptUrl: 'https://pay.stripe.com/receipt/test' // Mock receipt URL
      });
      await payment.save();

      // Send receipt email
      const EmailService = require('../../services/email/EmailService');
      await EmailService.sendPaymentReceiptEmail(user, payment);

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            subscription: user.subscription,
            isAdmin: user.isAdmin
          }
        }
      });

    } catch (error) {
      logger.error('Mock upgrade failed:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();