// ============================================
// src/models/Result.js
// ============================================

const mongoose = require('mongoose');

// Cost item schema for detailed breakdown
const costItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    category: String,
    flagged: Boolean,
    reason: String
  },
  { _id: false }
);

// Red flag schema
const redFlagSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: String
  },
  { _id: false }
);

// Question schema
const questionSchema = new mongoose.Schema(
  {
    question: String,
    category: String,
    importance: {
      type: String,
      enum: ['must-ask', 'should-ask', 'nice-to-ask', 'critical'],
      default: 'should-ask'
    }
  },
  { _id: false }
);

// Recommendation schema
const recommendationSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    potentialSavings: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'complex'],
      default: 'moderate'
    }
  },
  { _id: false }
);

// Benchmark schema
const benchmarkSchema = new mongoose.Schema(
  {
    item: String,
    quotePrice: Number,
    marketMin: Number,
    marketAvg: Number,
    marketMax: Number,
    percentile: Number // Where this quote sits (0-100)
  },
  { _id: false }
);

// Result schema
const resultSchema = new mongoose.Schema(
  {
    // References
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    // Analysis Results
    summary: {
      type: String,
      required: true
    },

    verdict: {
      type: String,
      required: true,
      enum: ['excellent', 'good', 'fair', 'overpriced', 'irrelevant']
    },

    verdictScore: {
      type: Number,
      min: 0,
      max: 100
    },

    verdictJustification: {
      type: String
    },

    isIrrelevant: {
      type: Boolean,
      default: false
    },

    // Free Tier Features
    overallCost: Number,
    labourCost: Number,
    materialsCost: Number,
    fairPriceRange: {
      min: Number,
      max: Number
    },

    // Standard Tier Features
    costBreakdown: [costItemSchema],

    redFlags: [redFlagSchema],

    questionsToAsk: [questionSchema],

    detailedReview: String,

    // Premium Tier Features
    recommendations: [recommendationSchema],

    benchmarking: [benchmarkSchema],

    marketContext: {
      city: String,
      tradeType: String,
      projectType: String,
      averageQuoteValue: Number,
      pricePercentile: Number
    },

    supplierInfo: {
      name: String,
      abn: String,
      email: String,
      phone: String,
      address: String
    },

    // Metadata about the analysis process
    metadata: {
      extractionMethod: { type: String, enum: ['text_extraction', 'ocr_fallback', 'vision_api', 'fallback_placeholder', 'text_input'], default: 'text_extraction' },
      pageCount: Number,
      processingTimeMs: Number,
      fileSize: Number
    },

    quoteComparison: {
      quotes: [
        {
          name: String,
          cost: Number,
          breakdown: Object
        }
      ],
      winner: {
        index: Number,
        reason: String
      },
      betterApproach: String,
      relativePricing: String,
      valueAssessment: String,
      keyDifferences: [String],
      disclaimer: String
    },

    // Analysis metadata
    extractedText: String,

    analysisAccuracy: {
      type: Number,
      min: 0,
      max: 100
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100
    },

    // Tier-specific flag
    tier: {
      type: String,
      enum: ['Free', 'Standard', 'Premium'],
      default: 'Free',
      index: true
    },

    // Soft delete
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'results'
  }
);

// Indexes
resultSchema.index({ jobId: 1 });
resultSchema.index({ userId: 1, createdAt: -1 });
resultSchema.index({ verdict: 1 });
resultSchema.index({ tier: 1 });

// Virtual for hard-deleted check
resultSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

module.exports = mongoose.model('Result', resultSchema);