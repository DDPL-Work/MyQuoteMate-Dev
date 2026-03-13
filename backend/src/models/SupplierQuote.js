const mongoose = require('mongoose');

const supplierQuoteSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        index: true
    },
    quoteNumber: {
        type: String,
        trim: true
    },
    quoteDate: {
        type: Date
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'AUD'
    },
    tradeCategory: {
        type: String,
        trim: true
    },
    rawText: {
        type: String,
        select: false // Avoid pulling massive text unless needed
    },
    scores: {
        completeness: Number,
        clarity: Number,
        risk: Number,
        total: Number
    }
}, {
    timestamps: true,
    collection: 'supplier_quotes'
});

module.exports = mongoose.model('SupplierQuote', supplierQuoteSchema);
