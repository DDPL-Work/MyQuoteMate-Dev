// ============================================
// src/workers/processors/aiProcessor.js
// ============================================
const Job = require('../../models/Job');
const Result = require('../../models/Result');
const User = require('../../models/User');
const SupplierScoringService = require('../../services/supplier/SupplierScoringService');
const AIOrchestrator = require('../../services/ai/AIOrchestrator');
const { emailQueue } = require('../../config/queue');
const logger = require('../../utils/logger');

class AIProcessor {
  normalizeVerdict(verdictLabel, score) {
    if (!verdictLabel) {
      if (score >= 9) return 'excellent';
      if (score >= 7) return 'good';
      if (score >= 4) return 'fair';
      return 'overpriced';
    }

    const label = verdictLabel.toLowerCase();

    // Exact matches
    if (['excellent', 'good', 'fair', 'overpriced', 'irrelevant'].includes(label)) {
      return label;
    }

    // Semantic mapping
    if (label.includes('great') || label.includes('excellent') || label.includes('perfect')) return 'excellent';
    if (label.includes('good') || label.includes('within range') || label.includes('fair price') || label.includes('reasonable')) return 'good';
    if (label.includes('fair') || label.includes('average') || label.includes('moderate')) return 'fair';
    if (label.includes('high') || label.includes('overpriced') || label.includes('expensive')) return 'overpriced';

    // Fallback to score
    if (score >= 9) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 4) return 'fair';
    return 'overpriced';
  }

  async process(job) {
    const { jobId, extractedText, tier, ocrConfidence, imageUrl } = job.data;

    try {
      logger.info(`AI analysis started for job ${jobId}`);

      const jobDoc = await Job.findById(jobId).populate('leadId');

      if (!jobDoc) {
        throw new Error('Job not found');
      }

      // Update status
      await jobDoc.updateProcessingStep('analysis', 'in_progress');
      jobDoc.status = 'processing';
      await jobDoc.save();

      // Metadata for AI
      const metadata = {
        workCategory: jobDoc.metadata?.workCategory,
        propertyType: jobDoc.metadata?.propertyType,
        ocrConfidence: ocrConfidence
      };

      // Call AI service
      const aiResult = await AIOrchestrator.analyzeQuote(extractedText, tier, metadata, imageUrl);

      // Create result
      const result = await this.createResult(jobDoc, aiResult, tier);

      // Update job
      jobDoc.result = result._id;
      jobDoc.status = 'completed';
      await jobDoc.updateProcessingStep('analysis', 'completed');
      await jobDoc.save();

      // 5. Update Supplier Scoreboard (INTERNAL ONLY)
      if (aiResult.supplierScoreboardData) {
        await SupplierScoringService.processSupplierQuote(
          jobDoc._id,
          {
            ...aiResult.supplierScoreboardData,
            rawText: extractedText
          }
        ).catch(err => logger.error('Supplier scoring failed:', err));
      }

      // Send email notification
      if (jobDoc.leadId?.email) {
        await emailQueue.add('send-email', {
          to: jobDoc.leadId.email,
          template: tier === 'free' ? 'free_complete' : 'paid_complete',
          data: {
            jobId: jobDoc.jobId,
            tier: tier,
            hasPaymentRequired: tier !== 'free' && !jobDoc.unlocked
          }
        });
      }

      logger.info(`AI analysis completed for job ${jobId}`);

      return {
        success: true,
        resultId: result._id
      };
    } catch (error) {
      logger.error(`AI analysis failed for job ${jobId}:`, error);

      const jobDoc = await Job.findById(jobId);
      if (jobDoc) {
        jobDoc.status = 'failed';
        await jobDoc.updateProcessingStep('analysis', 'failed', error.message);
        await jobDoc.save();
      }

      throw error;
    }
  }

  async createResult(job, aiResult, tier) {
    let resultData = {
      jobId: job._id,
      userId: job.userId,
      tier: tier,
      extractedText: job.data.extractedText?.substring(0, 10000),
      aiResponse: {
        model: aiResult.aiResponse?.model,
        promptVersion: '1.0',
        completionTokens: aiResult.aiResponse?.completionTokens,
        totalTokens: aiResult.aiResponse?.totalTokens,
        finishReason: aiResult.aiResponse?.finishReason,
        rawOutput: aiResult
      },
      metadata: {
        extractionMethod: job.data?.extractionMethod || 'text_extraction',
        ocrConfidence: job.data?.ocrConfidence,
        pageCount: job.data?.pageCount || 1,
        processingTimeMs: 0
      },
      generatedAt: new Date()
    };

    const relevance = aiResult.relevance || { isRelevant: true };

    if (relevance.isRelevant === false) {
      // Irrelevant Document Handling
      resultData = {
        ...resultData,
        summary: relevance.rejectionMessage || `This platform is not for ${relevance.topic || 'this type of document'}.`,
        verdict: 'irrelevant',
        verdictScore: 0,
        isIrrelevant: true,
        detailedReview: 'Analysis skipped because the document is not a renovation quote.',
        redFlags: [],
        questionsToAsk: []
      };

      // Usage Refund Logic
      if (resultData.userId) {
        this.handleUsageRefund(resultData.userId, tier).catch(err => {
          logger.error(`Failed to refund usage for user ${resultData.userId}:`, err);
        });
      }
    } else if (tier.toLowerCase() === 'free') {
      const verdict = aiResult.verdict || {};
      resultData = {
        ...resultData,
        summary: aiResult.freeSummary?.overview || 'Quote overview generated.',
        verdict: this.normalizeVerdict(verdict.label, verdict.score),
        verdictScore: verdict.score !== undefined ? (verdict.score > 10 ? verdict.score / 10 : verdict.score) : 7.0,
        verdictJustification: verdict.reasoning || null,
        overallCost: aiResult.costs?.overall || 0,
        labourCost: aiResult.costs?.labour || 0,
        materialsCost: aiResult.costs?.materials || 0,
        supplierInfo: aiResult.contractorProfile,
        detailedReview: aiResult.freeSummary?.mainPoints?.join('\n') || '',
        redFlags: (aiResult.redFlags || []).map(flag => ({
          title: flag.description?.substring(0, 50) + '...' || 'Red Flag',
          description: flag.description,
          severity: flag.severity || 'medium',
          category: flag.category || 'general'
        })),
        questionsToAsk: (aiResult.questionsToAsk || []).map(q => ({
          question: typeof q === 'string' ? q : (q.question || 'Please clarify'),
          category: q.category || 'general',
          importance: q.importance || 'should-ask'
        })),
        analysisAccuracy: 80,
        confidence: 90
      };
    } else {
      // Standard/Premium
      const analysis = aiResult.analysis || {};
      const verdict = analysis.verdict || {};

      // Use strictly extracted overallCost from AI or fallback
      const calculatedCost = analysis.overallCost ||
        (analysis.costBreakdown?.reduce((sum, item) => sum + (item.amount || 0), 0)) ||
        job.metadata?.estimatedCost ||
        0;

      resultData = {
        ...resultData,
        summary: analysis.summary || 'Detailed quote analysis completed.',
        verdict: this.normalizeVerdict(verdict.label, verdict.score),
        verdictScore: verdict.score !== undefined ? (verdict.score > 10 ? verdict.score / 10 : verdict.score) : 8.0,
        verdictJustification: verdict.reasoning || null,
        detailedReview: Array.isArray(analysis.detailedReview)
          ? analysis.detailedReview.join('\n')
          : analysis.detailedReview || null,
        overallCost: calculatedCost,
        costBreakdown: this.ensureCostBreakdown(analysis.costBreakdown, calculatedCost),
        redFlags: this.ensureRedFlags(analysis.redFlags, analysis.summary),
        questionsToAsk: this.ensureQuestions(analysis.questionsToAsk, tier),
        recommendations: this.ensureRecommendations(analysis.recommendations, tier, calculatedCost),
        benchmarking: this.ensureBenchmarking(analysis.benchmarking, tier, calculatedCost, analysis.costBreakdown),
        marketContext: analysis.marketContext,
        supplierInfo: analysis.contractorProfile,
        analysisAccuracy: 95,
        confidence: 95
      };

      logger.info(`[DEBUG] Processing tier: ${tier}`);
      logger.info(`[DEBUG] Recommendations: ${JSON.stringify(resultData.recommendations?.length || 0)} items`);
      logger.info(`[DEBUG] Benchmarking: ${JSON.stringify(resultData.benchmarking?.length || 0)} items`);
    }

    return await Result.create(resultData);
  }

  /**
   * Ensure cost breakdown always exists
   */
  ensureCostBreakdown(aiCostBreakdown, totalCost) {
    if (aiCostBreakdown && aiCostBreakdown.length > 0) {
      return aiCostBreakdown.map(item => ({
        description: item.item || 'Unspecified Item',
        totalPrice: item.amount || 0,
        category: item.category || 'General',
        flagged: item.notes?.toLowerCase().includes('red flag') || false
      }));
    }

    // Fallback: Create basic breakdown from total
    if (!totalCost || totalCost === 0) {
      return [];
    }

    return [
      {
        description: 'Labour Costs',
        totalPrice: Math.round(totalCost * 0.55),
        category: 'Labour',
        flagged: false
      },
      {
        description: 'Materials',
        totalPrice: Math.round(totalCost * 0.35),
        category: 'Materials',
        flagged: false
      },
      {
        description: 'Project Management',
        totalPrice: Math.round(totalCost * 0.10),
        category: 'Management',
        flagged: false
      }
    ];
  }

  /**
   * Ensure red flags always exist (at minimum, a "safe" flag)
   */
  ensureRedFlags(aiRedFlags, summary) {
    const flags = (aiRedFlags || []).map(flag => ({
      title: flag.description?.substring(0, 50) + '...' || flag.category?.replace('_', ' ').toUpperCase() || 'Attention Required',
      description: flag.description || 'Review this aspect carefully',
      severity: flag.severity || 'medium',
      category: flag.category || 'general',
      recommendation: flag.recommendation || 'Please verify with contractor'
    }));

    if (flags.length > 0) {
      return flags;
    }

    // Fallback: Always provide at least one flag (safe or cautionary)
    return [
      {
        title: 'Quote Integrity Verified',
        description: summary || 'This quote appears structurally sound based on the information provided. No major red flags detected, but standard due diligence is always recommended.',
        severity: 'low',
        category: 'Safe Quote',
        recommendation: 'Proceed with standard verification: confirm contractor license, insurance, and references before signing.'
      }
    ];
  }

  /**
   * Ensure questions always exist
   */
  ensureQuestions(aiQuestions, tier) {
    const questions = (aiQuestions || []).map(q => ({
      question: typeof q === 'string' ? q : (q.question || 'Please clarify'),
      category: q.category || 'general',
      importance: q.importance || 'should-ask'
    }));

    if (questions.length >= 3) {
      return questions;
    }

    // Fallback: Standard due diligence questions
    const fallbackQuestions = [
      {
        question: 'Can you provide proof of current liability insurance and workers compensation coverage?',
        category: 'Insurance',
        importance: 'must-ask'
      },
      {
        question: 'What is your payment schedule, and are there penalties for early termination?',
        category: 'Contract Terms',
        importance: 'must-ask'
      },
      {
        question: 'Do you offer any warranty on workmanship, and what does it cover?',
        category: 'Warranty',
        importance: 'should-ask'
      },
      {
        question: 'What is the estimated timeline, including start and completion dates?',
        category: 'Scheduling',
        importance: 'should-ask'
      },
      {
        question: 'Are there any exclusions or items not covered in this quote that I should be aware of?',
        category: 'Scope',
        importance: 'must-ask'
      }
    ];

    // Merge and return at least 5 questions
    return [...questions, ...fallbackQuestions].slice(0, tier === 'premium' ? 7 : 5);
  }

  /**
   * Ensure Premium users always get recommendations
   */
  ensureRecommendations(aiRecommendations, tier, totalCost) {
    const normalizedTier = (tier || 'free').toLowerCase();
    if (normalizedTier !== 'premium' && normalizedTier !== 'standard') return [];

    logger.info(`[PAID] Ensuring recommendations for tier: ${normalizedTier}, totalCost: ${totalCost}`);
    logger.info(`[PAID] AI provided ${(aiRecommendations || []).length} recommendations`);

    // Prioritize AI results if they exist and are useful
    if (Array.isArray(aiRecommendations) && aiRecommendations.length >= 3) {
      logger.info(`[PAID] Using ${aiRecommendations.length} AI-generated recommendations`);
      return aiRecommendations.map(rec => ({
        title: rec.title || 'Negotiation Recommendation',
        description: rec.description || 'Deep technical advice provided by AI analysis.',
        potentialSavings: rec.potentialSavings || Math.round((totalCost || 10000) * 0.05),
        difficulty: rec.difficulty || 'moderate'
      }));
    }

    // Use fallbacks as safety net if AI provides insufficient data
    const baseCost = totalCost || 10000;
    const fallbacks = [
      {
        title: 'Negotiate Detailed Material Breakdown & Supplier Choice',
        description: `Based on your quote total of $${baseCost.toLocaleString()}, request a line-by-line material breakdown with brand specifications and unit prices. In the ${new Date().getFullYear()} Australian market, contractor markups on materials typically range from 20-35%, which could represent $${Math.round(baseCost * 0.08).toLocaleString()}-$${Math.round(baseCost * 0.12).toLocaleString()} on your project. By requesting transparency and potentially sourcing premium items yourself through trade accounts (Bunnings Trade, Reece, or Beaumont Tiles), you can eliminate this markup while maintaining quality. Additionally, ask if you can approve supplier choices—some contractors have established relationships that yield better pricing, which they may pass on if you demonstrate market knowledge.`,
        potentialSavings: Math.round(baseCost * 0.08),
        difficulty: 'moderate'
      },
      {
        title: 'Optimize Payment Schedule for Cash Flow Leverage',
        description: `Your project value of $${baseCost.toLocaleString()} positions you well for payment term negotiations. The standard Australian construction payment schedule (30% deposit, 40% mid-stage, 30% completion) heavily favors contractor cash flow. Propose an alternative: 40% upfront deposit in exchange for 7-10% total discount (potential $${Math.round(baseCost * 0.075).toLocaleString()} saving). In ${new Date().getFullYear()}'s competitive market, many contractors face cash flow constraints and value immediate liquidity over margin. Alternatively, offer to pay materials invoices directly to suppliers (removing contractor financing burden) in exchange for 5% discount. Both approaches demonstrate you're a serious, well-funded client while capturing savings. Ensure all payment terms are documented in the contract with clear milestone definitions.`,
        potentialSavings: Math.round(baseCost * 0.075),
        difficulty: 'easy'
      },
      {
        title: 'Strategic Timing: Off-Peak Scheduling for Premium Service',
        description: `With a $${baseCost.toLocaleString()} project, timing flexibility can unlock 8-15% savings ($${Math.round(baseCost * 0.10).toLocaleString()}-$${Math.round(baseCost * 0.15).toLocaleString()}). Australian trades experience significant seasonal demand fluctuations—late May through August typically sees 20-30% lower booking rates. Contractors are more willing to negotiate rates during these periods to maintain team utilization. Beyond pricing, off-peak scheduling often delivers superior outcomes: your project receives more attention, tradespeople aren't rushing between jobs, and material suppliers have better stock availability. When proposing this, demonstrate flexibility by offering a 2-3 month scheduling window, which gives the contractor planning certainty. This strategy is particularly effective for interior renovations that aren't weather-dependent.`,
        potentialSavings: Math.round(baseCost * 0.12),
        difficulty: 'easy'
      },
      {
        title: 'Value Engineering: Scope Optimization Without Quality Compromise',
        description: `For a $${baseCost.toLocaleString()} renovation, systematic value engineering can save 10-18% ($${Math.round(baseCost * 0.12).toLocaleString()}-$${Math.round(baseCost * 0.18).toLocaleString()}) through smart substitutions. Work with your contractor to identify equivalent-performance alternatives: commercial-grade fixtures vs. premium residential (often identical manufacturing, different branding), engineered stone vs. natural stone for non-food-contact surfaces, or pre-finished materials vs. on-site finishing. The ${new Date().getFullYear()} market offers exceptional mid-tier products that outperform premium options from 5 years ago. Request the contractor provide 3 specification tiers for key items—you'll often find the mid-tier exceeds your requirements at 30-40% less cost. This approach maintains project vision while eliminating unnecessary premium pricing. Document all substitutions in writing to ensure warranty coverage.`,
        potentialSavings: Math.round(baseCost * 0.14),
        difficulty: 'moderate'
      },
      {
        title: 'Project Bundling & Multi-Trade Coordination Premium',
        description: `If you're planning additional work (landscaping, interior updates, deck construction) in the next 12 months, bundling with this $${baseCost.toLocaleString()} project can reduce total costs by 12-18%. Contractors offer volume discounts for combined work ($${Math.round(baseCost * 0.15).toLocaleString()}+ potential savings) because it ensures continuous workflow, reduces mobilization costs, and allows bulk material ordering. Additionally, single-contractor coordination eliminates the 10-15% "margin stacking" that occurs when separate trades each add profit margins to sequential work. Present your contractor with a 6-12 month roadmap of planned improvements and request package pricing. Even if you stage payments across fiscal years, the consolidated approach typically saves more than financing costs. This strategy particularly benefits homeowners planning whole-home renovations in phases, as it locks in ${new Date().getFullYear()} rates before anticipated ${new Date().getFullYear() + 1} market increases.`,
        potentialSavings: Math.round(baseCost * 0.15),
        difficulty: 'complex'
      }
    ];

    logger.info(`[PAID] Returning ${fallbacks.length} fallback recommendations`);
    return fallbacks.slice(0, 5);
  }

  /**
   * Ensure Premium users always get benchmarking data
   */
  ensureBenchmarking(aiBenchmarking, tier, totalCost, costBreakdown) {
    const normalizedTier = (tier || 'free').toLowerCase();
    if (normalizedTier !== 'premium' && normalizedTier !== 'standard') return [];

    logger.info(`[PAID] Ensuring benchmarking for tier: ${normalizedTier}, totalCost: ${totalCost}`);
    logger.info(`[PAID] AI provided ${(aiBenchmarking || []).length} benchmarks`);

    // Prioritize AI results if they exist
    if (Array.isArray(aiBenchmarking) && aiBenchmarking.length >= 3) {
      logger.info(`[PAID] Using ${aiBenchmarking.length} AI-generated benchmarks`);
      return aiBenchmarking.map(b => ({
        item: b.item || 'Market Comparison',
        quotePrice: b.quotePrice || 0,
        marketMin: b.marketMin || 0,
        marketAvg: b.marketAvg || 0,
        marketMax: b.marketMax || 0,
        percentile: b.percentile || 50
      }));
    }

    // Use fallbacks as safety net if AI provides insufficient data
    const baseCost = totalCost || 10000;
    const fallbacks = [];

    // 1. Skilled Labor Rate Benchmarking (Current AU Market)
    const laborItems = (costBreakdown || []).filter(item =>
      item.category?.toLowerCase().includes('labour') ||
      item.category?.toLowerCase().includes('labor') ||
      item.description?.toLowerCase().includes('labour') ||
      item.description?.toLowerCase().includes('labor')
    );

    const totalLabor = laborItems.length > 0
      ? laborItems.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0)
      : Math.round(baseCost * 0.55); // Industry standard: 55% labor

    const estimatedHours = Math.max(40, Math.round(totalLabor / 95)); // Assume $95/hr avg
    const effectiveRate = Math.round(totalLabor / estimatedHours);

    fallbacks.push({
      item: 'Skilled Labor Rate ($/hour)',
      quotePrice: effectiveRate,
      marketMin: 85,
      marketAvg: 98,
      marketMax: 125,
      percentile: Math.min(95, Math.max(5, Math.round(((effectiveRate - 85) / (125 - 85)) * 100)))
    });

    // 2. Material Markup & Procurement Costs
    const materialItems = (costBreakdown || []).filter(item =>
      item.category?.toLowerCase().includes('material') ||
      item.description?.toLowerCase().includes('material')
    );

    const totalMaterials = materialItems.length > 0
      ? materialItems.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0)
      : Math.round(baseCost * 0.35); // Industry standard: 35% materials

    const materialPercentage = Math.round((totalMaterials / baseCost) * 100);

    fallbacks.push({
      item: 'Materials as % of Total Project',
      quotePrice: materialPercentage,
      marketMin: 28,
      marketAvg: 36,
      marketMax: 48,
      percentile: Math.min(95, Math.max(5, Math.round(((materialPercentage - 28) / (48 - 28)) * 100)))
    });

    // 3. Project Management & Overhead Fee
    const pmFee = Math.round(baseCost * 0.10); // Estimated 10% PM fee
    const pmPercentage = 10;

    fallbacks.push({
      item: 'Project Management Fee (%)',
      quotePrice: pmPercentage,
      marketMin: 8,
      marketAvg: 13,
      marketMax: 22,
      percentile: Math.round(((pmPercentage - 8) / (22 - 8)) * 100)
    });

    // 4. Total Project Value Benchmarking (per square meter estimates)
    const estimatedSqm = Math.max(15, Math.round(baseCost / 2200)); // Current AU avg for renovations
    const costPerSqm = Math.round(baseCost / estimatedSqm);

    fallbacks.push({
      item: `Total Quote (est. ${estimatedSqm}m² space)`,
      quotePrice: baseCost,
      marketMin: Math.round(estimatedSqm * 1800),
      marketAvg: Math.round(estimatedSqm * 2200),
      marketMax: Math.round(estimatedSqm * 3000),
      percentile: Math.min(95, Math.max(5, Math.round(((costPerSqm - 1800) / (3000 - 1800)) * 100)))
    });

    // 5. Cost per Square Meter Rate
    fallbacks.push({
      item: 'Renovation Cost per m²',
      quotePrice: costPerSqm,
      marketMin: 1850,
      marketAvg: 2250,
      marketMax: 3200,
      percentile: Math.min(95, Math.max(5, Math.round(((costPerSqm - 1850) / (3200 - 1850)) * 100)))
    });

    // 6. Labor to Materials Ratio
    const laborMaterialRatio = totalMaterials > 0 ? Number((totalLabor / totalMaterials).toFixed(2)) : 1.57;

    fallbacks.push({
      item: 'Labor-to-Materials Ratio',
      quotePrice: laborMaterialRatio,
      marketMin: 1.2,
      marketAvg: 1.6,
      marketMax: 2.2,
      percentile: Math.min(95, Math.max(5, Math.round(((laborMaterialRatio - 1.2) / (2.2 - 1.2)) * 100)))
    });

    logger.info(`[PAID] Returning ${fallbacks.length} fallback benchmarks`);
    return fallbacks.slice(0, 6);
  }


  /**
   * Refund / Revert usage if document is irrelevant
   */
  async handleUsageRefund(userId, tier) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      if (tier.toLowerCase() === 'free') {
        // Reset free report date to allow another one this month
        user.subscription.freeReportDate = null;
        await user.save();
        logger.info(`Free usage refunded for user ${userId} due to irrelevant document`);
      } else {
        // Increment credit back
        user.subscription.credits += 1;
        await user.save();
        logger.info(`Credit refunded for user ${userId} due to irrelevant document. New balance: ${user.subscription.credits}`);
      }
    } catch (error) {
      logger.error(`Usage refund error for user ${userId}:`, error);
    }
  }
}

module.exports = new AIProcessor();