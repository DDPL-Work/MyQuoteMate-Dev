const Job = require('../../models/Job');
// const openai = require('../../services/openai'); // Assuming OpenAI service exists, or we mock it

class ChatController {
    async getChatHistory(req, res, next) {
        // Implementation for Getting History
        try {
            const { jobId } = req.params;
            // Mock history for now
            res.json({ success: true, data: [] });
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req, res, next) {
        try {
            const { jobId } = req.params;
            const { message, history } = req.body;

            const job = await Job.findOne({ jobId }).populate('supplierId');
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

            const Supplier = require('../../models/Supplier');
            let supplierContext = "";
            if (job.supplierId) {
                const supplier = job.supplierId;
                supplierContext = `
SUPPLIER INTELLIGENCE:
The contractor is "${supplier.name}". 
- Risk Score: ${supplier.intelligence.riskScore}/100 (High is worse)
- Total Quotes Seen: ${supplier.intelligence.totalQuotesSeen}
- Pricing Trend: ${supplier.intelligence.averagePricing}
- Red Flag History: ${supplier.intelligence.redFlagCount} total flags across all jobs.
If the risk score is high (>=70) or there are many red flags, mention that our history shows some concerns. If low risk and many seen, mention they have a good track record.
`;
            }

            // SYSTEM PROMPTS BASED ON TIER
            let systemPrompt = "You are a helpful assistant." + supplierContext;
            if (job.tier === 'Free') {
                systemPrompt = "You are a basic assistant. You can only answer simple questions about the quote summary. If the user asks for deep market comparisons, negotiation tactics, or detailed red flag analysis, politely refuse and tell them to upgrade to Standard or Premium." + supplierContext;
            } else if (job.tier === 'Standard') {
                systemPrompt = "You are a Standard assistant. You can analyze costs and flags. However, if the user asks for multi-quote comparison or deep historical market benchmarking (Premium features), politely refuse and tell them to buy Premium." + supplierContext;
            } else if (job.tier === 'Premium') {
                systemPrompt = "You are an expert construction consultant. Answer all questions with deep detail, market benchmarking, and aggressive negotiation tactics." + supplierContext;
            }

            // Here you would call OpenAI with `systemPrompt`
            // const response = await openai.chat.completions.create({ model: "gpt-4", messages: [{role: "system", content: systemPrompt}, ...history, {role: "user", content: message}] });

            // MOCK RESPONSE FOR NOW (Simulation)
            const mockReply = `[${job.tier} Tier Bot]: I heard you ask: "${message}". Based on your ${job.tier} plan, I can tell you this quote looks interesting.`;

            res.json({
                success: true,
                data: {
                    reply: mockReply,
                    sender: 'bot',
                    timestamp: new Date()
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();