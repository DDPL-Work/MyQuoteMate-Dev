const mongoose = require('mongoose');

const bannedUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    reason: {
        type: String,
        default: 'Violation of terms'
    },
    bannedAt: {
        type: Date,
        default: Date.now
    },
    bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // or 'Admin'
    }
}, {
    timestamps: true,
    collection: 'banned_users'
});

// Index for fast lookups
bannedUserSchema.index({ email: 1 });
bannedUserSchema.index({ phone: 1 });

module.exports = mongoose.model('BannedUser', bannedUserSchema);
