// src/services/payment/StripeService.js
const Stripe = require('stripe');
const crypto = require('crypto');
const logger = require('../../utils/logger');
const Payment = require('../../models/Payment');
const Job = require('../../models/Job');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const EmailService = require('../../services/email/EmailService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'mock';

const PRICING = {
  Standard: 799, // $7.99 AUD in cents
  Premium: 999   // $9.99 AUD in cents
};

class StripeService {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Create payment intent for job upgrade or pack purchase
   */
  async createPaymentIntent(job, tier, metadata = {}) {
    if (!PRICING[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    if (PAYMENT_PROVIDER === 'mock') {
      return this.createMockPayment(job, tier, metadata);
    }

    try {
      const amount = PRICING[tier];
      const idempotencyKey = this._generateIdempotencyKey(job ? job.jobId : metadata.userId, tier);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'aud',
        description: `MyQuoteMate ${tier} Analysis Pack`,
        metadata: {
          jobId: job ? job.jobId : '',
          jobMongoId: job ? job._id.toString() : '',
          tier: tier,
          userId: metadata.userId?.toString() || 'guest'
        },
        automatic_payment_methods: {
          enabled: true
        }
      }, {
        idempotencyKey
      });

      // Create pending payment record
      await Payment.create({
        userId: metadata.userId || null,
        jobId: job ? job._id : null,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount / 100,
        currency: 'AUD',
        status: 'pending',
        tier,
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          source: 'web'
        }
      });

      // Audit log
      await AuditLog.log({
        userId: metadata.userId || null,
        action: 'payment.initiated',
        resourceType: 'payment',
        details: {
          jobId: job ? job.jobId : 'pack',
          tier,
          amount,
          paymentIntentId: paymentIntent.id
        },
        metadata: {
          ipAddress: metadata.ipAddress
        }
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount / 100,
        currency: 'AUD'
      };
    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);
      throw new Error('Payment initialization failed. Please try again.');
    }
  }

  /**
   * Retrieve payment intent from Stripe
   */
  async retrievePaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('Failed to retrieve payment intent:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment fulfillment
   */
  async fulfillOrder(paymentIntent) {
    try {
      const { jobId, jobMongoId, tier, userId } = paymentIntent.metadata;

      // 1. Find Payment record
      const payment = await Payment.findByPaymentIntent(paymentIntent.id);

      // Idempotency check using specific flag, not just status
      if (payment && payment.metadata?.credits_assigned === 'true') {
        logger.info(`Payment ${paymentIntent.id} already processed (credits assigned).`);
        return;
      }

      // 2. Update User Profile (Credits & Tier)
      if (userId && userId !== 'guest') {
        const user = await User.findById(userId);
        if (user) {
          const creditsToAdd = tier === 'Premium' ? 3 : 1;

          // Update credits
          const oldCredits = user.subscription.credits || 0;
          user.subscription.credits = oldCredits + creditsToAdd;
          user.subscription.reportsTotal = (user.subscription.reportsTotal || 0) + creditsToAdd;

          logger.info(`Adding ${creditsToAdd} credits to user ${user._id} (PI: ${paymentIntent.id}). Old=${oldCredits}, New=${user.subscription.credits}. Tier=${tier}`);

          // Update tier if it's an upgrade
          const tierLevels = { 'Free': 0, 'Standard': 1, 'Premium': 2 };
          const currentTier = user.subscription.plan || 'Free';
          if (tierLevels[tier] > tierLevels[currentTier] || tier === 'Premium') {
            user.subscription.plan = tier;
          }

          user.subscription.status = 'active';
          user.subscription.currentPeriodStart = new Date();
          await user.save();

          // Send Email
          if (payment) {
            await EmailService.sendPaymentReceiptEmail(user, payment);
          }
        } else {
          logger.warn(`User ${userId} not found for payment ${paymentIntent.id}`);
        }
      }

      // 3. Mark Payment Succeeded (and set flag)
      if (payment) {
        if (!payment.metadata) payment.metadata = {};
        payment.metadata.credits_assigned = 'true'; // Set flag BEFORE saving
        await payment.markAsSucceeded(paymentIntent.charges?.data[0]?.id);
      }

      // 4. Unlock Job if specific jobId was provided
      if (jobMongoId) {
        const job = await Job.findById(jobMongoId);
        if (job && !job.unlocked) {
          job.unlocked = true;
          job.tier = tier;
          await job.save();
          logger.info(`Job ${jobId} unlocked.`);
        }
      }

      // 4. Audit Log
      await AuditLog.log({
        userId: userId !== 'guest' ? userId : null,
        action: 'payment.succeeded',
        resourceType: 'payment',
        details: {
          jobId: jobId || 'pack',
          tier,
          amount: paymentIntent.amount,
          paymentIntentId: paymentIntent.id
        }
      });

      logger.info(`Fulfillment complete for PI: ${paymentIntent.id}`);
    } catch (error) {
      logger.error('Order fulfillment failed:', error);
      throw error;
    }
  }

  /**
   * Handle Webhook
   */
  async handleWebhook(req) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, this.webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      await this.fulfillOrder(event.data.object);
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const payment = await Payment.findByPaymentIntent(paymentIntent.id);
      if (payment) {
        await payment.markAsFailed(
          paymentIntent.last_payment_error?.code,
          paymentIntent.last_payment_error?.message
        );
      }
    }

    return true;
  }

  /**
   * Mock payment logic (remains as fallback/dev)
   */
  async createMockPayment(job, tier, metadata) {
    const amount = PRICING[tier] / 100;
    const payment = await Payment.create({
      userId: metadata.userId,
      jobId: job ? job._id : null,
      stripePaymentIntentId: `mock_${Date.now()}`,
      amount,
      currency: 'AUD',
      status: 'succeeded',
      tier,
      paidAt: new Date(),
      metadata: { source: 'mock', ...metadata }
    });

    if (job) {
      job.unlocked = true;
      job.tier = tier;
      await job.save();
    }

    if (metadata.userId) {
      const user = await User.findById(metadata.userId);
      if (user) {
        const creditsToAdd = tier === 'Premium' ? 3 : 1;
        user.subscription.credits = (user.subscription.credits || 0) + creditsToAdd;
        user.subscription.plan = tier;
        await user.save();
      }
    }

    return {
      paymentId: payment._id,
      amount,
      status: 'succeeded',
      provider: 'mock'
    };
  }

  _generateIdempotencyKey(id, tier) {
    return crypto.createHash('sha256').update(`${id}-${tier}-${Date.now()}`).digest('hex');
  }
}

module.exports = new StripeService();
