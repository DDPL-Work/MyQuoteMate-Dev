// Lead.js - For tracking email captures before account creation
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  source: {
    type: String,
    enum: ['free_upload', 'web_upload', 'guest_upload', 'landing_page', 'referral', 'other'],
    default: 'free_upload'
  },
  isGuest: {
    type: Boolean,
    default: false,
    index: true
  },
  guestUploadedAt: {
    type: Date
  },
  linkedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  status: {
    type: String,
    enum: ['new', 'engaged', 'converted', 'bounced'],
    default: 'new',
    index: true
  },
  convertedToUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedAt: Date,
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  emailsSent: [{
    type: {
      type: String // 'welcome', 'reminder', 'abandoned', 'promotional'
    },
    sentAt: Date,
    opened: Boolean,
    clicked: Boolean
  }]
}, {
  timestamps: true,
  collection: 'leads'
});

leadSchema.index({ email: 1, status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ convertedToUserId: 1 });
leadSchema.index({ isGuest: 1, email: 1 });
module.exports = mongoose.model('Lead', leadSchema);
