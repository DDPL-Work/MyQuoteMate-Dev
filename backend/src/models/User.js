// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    select: false
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Standard', 'Premium'],
      default: 'Free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      default: 'active'
    },
    credits: {
      type: Number,
      default: 0
    },
    freeReportDate: {
      type: Date,
      default: null
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    reportsUsed: {
      type: Number,
      default: 0
    },
    reportsTotal: {
      type: Number,
      default: 1
    }
  },
  preferences: {
    email: {
      type: Boolean,
      default: true
    },
    reportReady: {
      type: Boolean,
      default: true
    },
    promotional: {
      type: Boolean,
      default: false
    },
    reminders: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date
    }
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  deletedAt: {
    type: Date
  },
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  metadata: {
    registrationSource: String, // 'free_upload', 'payment', 'manual', 'google_oauth'
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  collection: 'users',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1, accountStatus: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for active subscription
userSchema.virtual('hasActiveSubscription').get(function () {
  return this.subscription.status === 'active';
});

// Virtual for admin check
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// Virtual for verification status (primary method: phone)
userSchema.virtual('isVerified').get(function () {
  return this.phoneVerified;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, rounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.security.lastLoginAt = new Date();
  return this.save();
};

// Method to check if user has specific role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    accountStatus: { $ne: 'deleted' }
  });
};

// Soft delete
userSchema.methods.softDelete = function () {
  this.accountStatus = 'deleted';
  this.deletedAt = new Date();
  // Anonymize email to allow reuse
  this.email = `deleted_${Date.now()}_${this.email}`;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);