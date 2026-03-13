const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false, // Changed from true to allow account-level credits purchase
    index: true
  },
  // Stripe data
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    index: true
  },
  stripeChargeId: {
    type: String
  },
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'AUD',
    uppercase: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'requires_action',
      'succeeded',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    ],
    required: true,
    default: 'pending',
    index: true
  },
  tier: {
    type: String,
    enum: ['Standard', 'Premium'],
    required: true
  },
  paymentMethod: {
    type: {
      type: String, // 'card', 'bank_transfer', etc.
    },
    last4: String,
    brand: String, // 'visa', 'mastercard', etc.
    expiryMonth: Number,
    expiryYear: Number
  },
  // Billing details
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'AU'
      }
    }
  },
  // Transaction metadata
  description: String,
  receiptEmail: String,
  receiptUrl: String,
  // Refund tracking
  refunds: [{
    stripeRefundId: String,
    amount: Number,
    reason: String,
    status: String,
    createdAt: Date
  }],
  refundedAmount: {
    type: Number,
    default: 0
  },
  // Idempotency
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  // Webhook tracking
  webhookEvents: [{
    eventId: String,
    eventType: String,
    receivedAt: Date,
    processed: Boolean
  }],
  // Failure tracking
  failureCode: String,
  failureMessage: String,
  // Fraud detection
  riskScore: Number,
  riskLevel: {
    type: String,
    enum: ['normal', 'elevated', 'highest']
  },
  // Timestamps
  paidAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String // 'web', 'mobile', 'api'
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ jobId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeCustomerId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for net amount (after refunds)
paymentSchema.virtual('netAmount').get(function () {
  return this.amount - this.refundedAmount;
});

// Virtual for checking if fully refunded
paymentSchema.virtual('isFullyRefunded').get(function () {
  return this.refundedAmount >= this.amount;
});

// Method to mark as succeeded
paymentSchema.methods.markAsSucceeded = function (chargeId, paidAt = new Date()) {
  this.status = 'succeeded';
  this.stripeChargeId = chargeId;
  this.paidAt = paidAt;
  return this.save();
};

// Method to mark as failed
paymentSchema.methods.markAsFailed = function (code, message) {
  this.status = 'failed';
  this.failureCode = code;
  this.failureMessage = message;
  return this.save();
};

// Method to add refund
paymentSchema.methods.addRefund = function (refundData) {
  this.refunds.push({
    stripeRefundId: refundData.id,
    amount: refundData.amount,
    reason: refundData.reason,
    status: refundData.status,
    createdAt: new Date()
  });

  this.refundedAmount += refundData.amount;

  if (this.isFullyRefunded) {
    this.status = 'refunded';
    this.refundedAt = new Date();
  } else {
    this.status = 'partially_refunded';
  }

  return this.save();
};

// Method to record webhook event
paymentSchema.methods.recordWebhookEvent = function (eventId, eventType) {
  const existingEvent = this.webhookEvents.find(e => e.eventId === eventId);

  if (!existingEvent) {
    this.webhookEvents.push({
      eventId,
      eventType,
      receivedAt: new Date(),
      processed: true
    });
    return this.save();
  }

  return Promise.resolve(this);
};

// Static method to find by payment intent
paymentSchema.statics.findByPaymentIntent = function (paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId });
};

// Static method to find user payments
paymentSchema.statics.findUserPayments = function (userId, options = {}) {
  const query = { userId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get revenue stats
paymentSchema.statics.getRevenueStats = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'succeeded',
        paidAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalRefunded: { $sum: '$refundedAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalRefunded: 1,
        netRevenue: { $subtract: ['$totalRevenue', '$totalRefunded'] },
        count: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);