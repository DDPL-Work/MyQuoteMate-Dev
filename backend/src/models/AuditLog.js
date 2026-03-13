const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      // User actions
      'user.register',
      'user.login',
      'user.logout',
      'user.password_reset',
      'user.email_verify',
      'user.delete_account',
      'user.profile_update',
      'user.avatar_upload',
      // Job actions
      'job.create',
      'job.upload_document',
      'job.process_start',
      'job.process_complete',
      'job.process_fail',
      'job.unlock',
      'job.delete',
      // Payment actions
      'payment.initiated',
      'payment.succeeded',
      'payment.failed',
      'payment.refund',
      // Document actions
      'document.upload',
      'document.ocr_start',
      'document.ocr_complete',
      'document.delete',
      // Admin actions
      'admin.access',
      'admin.user_suspend',
      'admin.data_export',
      'admin.supplier_update',
      // System actions
      'system.retention_cleanup',
      'system.error'
    ]
  },
  resourceType: {
    type: String,
    enum: ['user', 'job', 'document', 'payment', 'result', 'lead', 'supplier', 'system']
  },
  resourceId: {
    type: String,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Flexible for different action types
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String
  },
  result: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success'
  },
  errorMessage: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'audit_logs'
});

// Indexes for querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

// TTL index - keep audit logs for 2 years
auditLogSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 63072000 // 2 years
});

// Static method to create log entry
auditLogSchema.statics.log = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to create audit log:', error);
    return null;
  }
};

// Static method to query logs
auditLogSchema.statics.queryLogs = function(filters = {}, options = {}) {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.resourceType) query.resourceType = filters.resourceType;
  if (filters.resourceId) query.resourceId = filters.resourceId;
  if (filters.severity) query.severity = filters.severity;
  
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 1000)
    .select(options.select || '-details.sensitive');
};

// Helper method to sanitize sensitive data from logs
auditLogSchema.methods.sanitize = function() {
  const log = this.toObject();
  
  // Remove sensitive fields
  if (log.details) {
    delete log.details.password;
    delete log.details.token;
    delete log.details.apiKey;
    delete log.details.cardNumber;
  }
  
  return log;
};

module.exports = mongoose.model('AuditLog', auditLogSchema);