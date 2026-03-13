// ============================================
// src/models/Document.js
// ============================================

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    // Relation
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

    // Original file info
    originalFilename: {
      type: String,
      required: true,
      trim: true
    },

    fileSize: {
      type: Number,
      required: true
    },

    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']
    },

    // Storage
    storageKey: {
      type: String,
      required: true,
      index: true
    },

    // Integrity
    checksumMD5: {
      type: String,
      required: true,
      index: true
    },

    checksumSHA256: {
      type: String,
      required: true,
      index: true
    },

    // Processing
    extractionStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true
    },

    extractedText: {
      type: String
    },

    extractionError: {
      type: String
    },

    extractedAt: {
      type: Date
    },

    // Metadata
    metadata: {
      pageCount: Number,
      language: String,
      ocrEngine: String,
      processingTimeMs: Number
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
    collection: 'documents'
  }
);

// --------------------------------------------------
// Indexes
// --------------------------------------------------
documentSchema.index({ jobId: 1, createdAt: -1 });
documentSchema.index({ extractionStatus: 1 });

// --------------------------------------------------
// Instance methods
// --------------------------------------------------
documentSchema.methods.markProcessing = function () {
  this.extractionStatus = 'processing';
  return this.save();
};

documentSchema.methods.markCompleted = function (text, metadata = {}) {
  this.extractionStatus = 'completed';
  this.extractedText = text;
  this.metadata = metadata;
  this.extractedAt = new Date();
  return this.save();
};

documentSchema.methods.markFailed = function (error) {
  this.extractionStatus = 'failed';
  this.extractionError = error;
  return this.save();
};

// --------------------------------------------------
// Model export (CRITICAL)
// --------------------------------------------------
module.exports = mongoose.model('Document', documentSchema);