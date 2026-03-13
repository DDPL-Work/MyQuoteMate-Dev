const mongoose = require('mongoose');

const discountUsageSchema = new mongoose.Schema({
    discountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        index: true
    },
    code: String,
    amountSaved: Number,
    usedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('DiscountUsage', discountUsageSchema);
