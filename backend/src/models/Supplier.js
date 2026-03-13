const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  tradingName: {
    type: String,
    trim: true
  },
  abn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true
  },
  firstSeenAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  quoteCount: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000
  },
  confidence: {
    type: String,
    enum: ['LOW', 'MED', 'HIGH'],
    default: 'LOW'
  }
}, {
  timestamps: true,
  collection: 'suppliers'
});

supplierSchema.index({ supplierName: 1 });
supplierSchema.index({ score: -1 });

module.exports = mongoose.model('Supplier', supplierSchema);
