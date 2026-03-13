const Supplier = require('../../models/Supplier');
const SupplierQuote = require('../../models/SupplierQuote');
const SupplierStats = require('../../models/SupplierStats');
const logger = require('../../utils/logger');

class SupplierScoringService {
    /**
     * Compute score for a single quote
     * @param {Object} extraction - AI extracted details from quote
     * @returns {Object} { scores, supplierDetails }
     */
    async calculateQuoteScore(extraction) {
        const {
            supplierName,
            abn,
            phone,
            email,
            address,
            quoteDate,
            quoteNumber,
            totalAmount,
            breakdownPresent,
            inclusionsPresent,
            exclusionsPresent,
            specificScope,
            vaguePhrasesCount,
            hasProvisionalSum,
            isLumpSumOnlyForMultiStep,
            hasBroadRiskExclusion,
            rawText
        } = extraction;

        // 3.2 Completeness Rules (0–400)
        let completeness = 0;
        if (supplierName) completeness += 50;
        if (abn) completeness += 80;
        if (phone || email) completeness += 40;
        if (address) completeness += 30;
        if (quoteDate) completeness += 40;
        if (quoteNumber) completeness += 20;
        if (totalAmount) completeness += 80;
        if (breakdownPresent) completeness += 60;

        // 3.3 Clarity Rules (0–300)
        let clarity = 0;
        if (inclusionsPresent) clarity += 100;
        if (exclusionsPresent) clarity += 100;
        if (specificScope) clarity += 100;

        // 3.4 Risk Rules (start at 300, subtract penalties)
        let risk = 300;
        const vaguePenalty = Math.min(150, (vaguePhrasesCount || 0) * 25);
        risk -= vaguePenalty;
        if (hasProvisionalSum) risk -= 75;
        if (isLumpSumOnlyForMultiStep) risk -= 75;
        if (hasBroadRiskExclusion) risk -= 50;
        risk = Math.max(0, risk);

        const total = completeness + clarity + risk;

        return {
            scores: { completeness, clarity, risk, total },
            supplierDetails: {
                supplierName,
                tradingName: extraction.tradingName || '',
                abn,
                phone,
                email,
                address,
                lastSeenAt: new Date()
            }
        };
    }

    /**
     * Main entry point to process a quote for a supplier
     */
    async processSupplierQuote(jobId, extraction) {
        try {
            const { scores, supplierDetails } = await this.calculateQuoteScore(extraction);

            // 1. Extract identifiers and Upsert Supplier
            let supplier;
            if (supplierDetails.abn) {
                supplier = await Supplier.findOne({ abn: supplierDetails.abn });
            } else {
                // Fallback to name match (basic)
                supplier = await Supplier.findOne({
                    supplierName: { $regex: new RegExp(`^${supplierDetails.supplierName}$`, 'i') }
                });
            }

            if (!supplier) {
                supplier = new Supplier({
                    ...supplierDetails,
                    firstSeenAt: new Date(),
                    quoteCount: 1,
                    score: scores.total,
                    confidence: 'LOW'
                });
            } else {
                // Update existing supplier
                supplier.lastSeenAt = new Date();
                supplier.quoteCount += 1;

                // 5. Update supplier score (70% latest, 30% previous)
                supplier.score = Math.round((scores.total * 0.7) + (supplier.score * 0.3));

                // 6. Update confidence
                if (supplier.quoteCount >= 3) {
                    supplier.confidence = 'HIGH';
                } else if (supplier.quoteCount >= 2) {
                    supplier.confidence = 'MED';
                }

                // Update contact info if missing
                if (!supplier.phone && supplierDetails.phone) supplier.phone = supplierDetails.phone;
                if (!supplier.email && supplierDetails.email) supplier.email = supplierDetails.email;
                if (!supplier.address && supplierDetails.address) supplier.address = supplierDetails.address;
            }

            await supplier.save();

            // 3. Save the quote record
            const quote = new SupplierQuote({
                supplierId: supplier._id,
                jobId,
                quoteNumber: extraction.quoteNumber,
                quoteDate: extraction.quoteDate,
                totalAmount: extraction.totalAmount,
                tradeCategory: extraction.tradeCategory,
                rawText: extraction.rawText,
                scores
            });
            await quote.save();

            // 7. Update supplier_quote_stats
            await this.updateSupplierStats(supplier._id, quote);

            return { supplier, quote };
        } catch (error) {
            logger.error('Error processing supplier quote:', error);
            throw error;
        }
    }

    async updateSupplierStats(supplierId, latestQuote) {
        let stats = await SupplierStats.findOne({ supplierId });
        const allQuotes = await SupplierQuote.find({ supplierId }).sort({ createdAt: -1 });

        const totals = allQuotes.map(q => q.totalAmount);
        const sortedTotals = [...totals].sort((a, b) => a - b);

        // Median calc
        const mid = Math.floor(sortedTotals.length / 2);
        const median = sortedTotals.length % 2 !== 0
            ? sortedTotals[mid]
            : (sortedTotals[mid - 1] + sortedTotals[mid]) / 2;

        const min = sortedTotals[0];
        const max = sortedTotals[sortedTotals.length - 1];

        // Price drift vs last
        let priceChangePct = 0;
        if (allQuotes.length > 1) {
            const prevTotal = allQuotes[1].totalAmount;
            priceChangePct = ((latestQuote.totalAmount - prevTotal) / prevTotal) * 100;
        }

        if (!stats) {
            stats = new SupplierStats({
                supplierId,
                lastTotalAmount: latestQuote.totalAmount,
                medianTotalAmount: median,
                minTotalAmount: min,
                maxTotalAmount: max,
                lastQuoteDate: latestQuote.quoteDate || latestQuote.createdAt,
                priceChangePctVsLast: priceChangePct
            });
        } else {
            stats.lastTotalAmount = latestQuote.totalAmount;
            stats.medianTotalAmount = median;
            stats.minTotalAmount = min;
            stats.maxTotalAmount = max;
            stats.lastQuoteDate = latestQuote.quoteDate || latestQuote.createdAt;
            stats.priceChangePctVsLast = priceChangePct;
        }

        await stats.save();
    }
}

module.exports = new SupplierScoringService();
