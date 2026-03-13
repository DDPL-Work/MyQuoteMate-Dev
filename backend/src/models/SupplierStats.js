const mongoose = require('mongoose');

const supplierStatsSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        unique: true,
        index: true
    },
    lastTotalAmount: {
        type: Number
    },
    medianTotalAmount: {
        type: Number
    },
    minTotalAmount: {
        type: Number
    },
    maxTotalAmount: {
        type: Number
    },
    lastQuoteDate: {
        type: Date
    },
    priceChangePctVsLast: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'supplier_stats'
});

module.exports = mongoose.model('SupplierStats', supplierStatsSchema);
