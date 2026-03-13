// backend/src/models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
        required: true,
        select: false
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'moderator'],
        default: 'admin'
    },
    permissions: [{
        type: String
    }],
    lastLoginAt: {
        type: Date
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true,
    collection: 'admins'
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
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
adminSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('Admin', adminSchema);
