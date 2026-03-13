// ============================================
// src/services/ai/AIOrchestrator.js
// ============================================

const OpenAI = require('openai');
const pRetry = require('p-retry').default;
const openaiConfig = require('../../config/openai');
const PromptBuilder = require('./PromptBuilder');
const logger = require('../../utils/logger');

/**
 * HARD tier limits (cost safety)
 */
const TIER_LIMITS = {
  free: {
    maxInputChars: 10000,
    maxOutputTokens: 10000
  },
  standard: {
    maxInputChars: 250000, // Significantly increased for large PDFs
    maxOutputTokens: 20000
  },
  premium: {
    maxInputChars: 800000, // Significantly increased for large PDFs
    maxOutputTokens: 36384 // Maximum for long analysis
  }
};

class AIOrchestrator {
  constructor() {
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      timeout: openaiConfig.timeout
    });

    this.model = openaiConfig.model; // gpt-5-nano
    this.temperature = openaiConfig.temperature;
  }

  /**
   * Enforce tier-based input limits
   */
  applyInputLimit(text, tier) {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.Free;

    if (typeof text !== 'string') return '';

    if (text.length > limits.maxInputChars) {
      logger.warn('AI input truncated', {
        tier,
        originalLength: text.length,
        allowed: limits.maxInputChars
      });
      return text.slice(0, limits.maxInputChars);
    }

    return text;
  }

  /**
   * Analyze single quote
   */
  async analyzeQuote(extractedText, rawTier = 'free', metadata = {}, imageUrl = null) {
    const tier = rawTier.toLowerCase();
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

    try {
      logger.info('AI analysis started', { tier, hasImage: !!imageUrl });

      const safeText = this.applyInputLimit(extractedText, tier);

      const systemPrompt = PromptBuilder.buildSystemPrompt(tier);
      let userPrompt = PromptBuilder.buildUserPrompt(safeText, metadata);

      // If we have an image, we need to construct the content array for OpenAI Vision
      if (imageUrl) {
        // userPrompt from PromptBuilder is a string. We need to wrap it.
        userPrompt = [
          { type: "input_text", text: userPrompt },
          {
            type: "input_image",
            image_url: imageUrl
          }
        ];
      }

      const response = await this.callOpenAI({
        systemPrompt,
        userPrompt,
        maxOutputTokens: limits.maxOutputTokens,
        // Ensure model is vision compatible if image is sent
        model: imageUrl ? 'gpt-4o' : undefined
      });

      // DEBUG LOGGING
      logger.info('Raw OpenAI Response:', {
        response: JSON.stringify(response, null, 2)
      });

      const parsed = this.parseResponse(response, tier);

      logger.info('AI analysis completed', {
        tier,
        totalTokens: response.usage?.total_tokens
      });

      return parsed;
    } catch (error) {
      logger.error('AI analysis failed', { error: error.message });
      throw new Error('AI analysis failed. Please try again.');
    }
  }

  /**
   * Compare quotes (Premium only)
   */
  async compareQuotes(quotes = [], metadata = {}) {
    if (!Array.isArray(quotes) || quotes.length < 2) {
      throw new Error('At least two quotes are required');
    }

    if (quotes.length > 3) {
      throw new Error('Maximum 3 quotes allowed');
    }

    try {
      logger.info('AI comparison started', { count: quotes.length });

      const systemPrompt = PromptBuilder.buildComparisonSystemPrompt();
      const userPrompt = PromptBuilder.buildComparisonUserPrompt(quotes, metadata);

      const response = await this.callOpenAI({
        systemPrompt,
        userPrompt,
        maxOutputTokens: TIER_LIMITS.premium.maxOutputTokens
      });

      return this.parseComparisonResponse(response);
    } catch (error) {
      logger.error('AI comparison failed', { error: error.message });
      throw new Error('Quote comparison failed. Please try again.');
    }
  }

  /**
   * ✅ CORRECT GPT-5-NANO RESPONSES API CALL
   */
  async callOpenAI({ systemPrompt, userPrompt, maxOutputTokens, model }) {
    return pRetry(
      async () => {
        const requestOptions = {
          model: model || this.model,

          input: [
            {
              role: 'system',
              content: [
                { type: 'input_text', text: systemPrompt }
              ]
            },
            {
              role: 'user',
              content: Array.isArray(userPrompt)
                ? userPrompt
                : [{ type: 'input_text', text: userPrompt }]
            }
          ],

          max_output_tokens: maxOutputTokens,

          // ✅ ONLY VALID JSON MODE
          text: {
            format: { type: 'json_object' }
          }
        };

        const activeModel = model || this.model;

        // Temperature check: GPT-5 (and o1-like models) do not support temperature
        if (activeModel.includes('gpt-5') || activeModel.includes('o1')) {
          // For reasoning models, try to reduce effort to save tokens
          requestOptions.reasoning = { effort: 'low' };
        } else {
          requestOptions.temperature = this.temperature;
        }

        return this.client.responses.create(requestOptions);
      },
      {
        retries: openaiConfig.maxRetries ?? 3,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 3000,
        onFailedAttempt: (error) => {
          logger.warn(`OpenAI retry ${error.attemptNumber}`, {
            error: error.message
          });
        }
      }
    );
  }

  normalizeDetailedReview(value) {
    if (Array.isArray(value)) {
      return value
        .map(item => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }

    if (typeof value !== 'string') {
      return [];
    }

    const normalized = value
      .replace(/\r/g, '\n')
      .replace(/[•●▪◦]/g, '\n- ')
      .replace(/[✓✔]/g, '\n- ')
      .replace(/[⚠]/g, '\n- ')
      .trim();

    let points = normalized
      .split(/\n+/)
      .map(part => part.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);

    if (points.length <= 1) {
      points = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map(part => part.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }

    return points.filter(point => point.length > 8);
  }

  /**
   * Parse single-quote response
   */
  parseResponse(response, tier) {
    // Check for incomplete responses first
    if (response.status === 'incomplete') {
      const reason = response.incomplete_details?.reason || 'unknown';
      logger.warn('AI response incomplete', { reason, tier });
      throw new Error(`AI analysis incomplete (limit reached: ${reason}). Please try again or upgrade tier.`);
    }

    // Concatenate all text fragments from the response
    let outputText = '';
    if (response.output && Array.isArray(response.output)) {
      response.output.forEach(msg => {
        if (msg.content && Array.isArray(msg.content)) {
          msg.content.forEach(part => {
            if (part.type === 'output_text' && part.text) {
              outputText += part.text;
            }
          });
        }
      });
    }

    // Fallback for older response formats if applicable
    if (!outputText && response.output_text) {
      outputText = response.output_text;
    }

    if (!outputText) {
      throw new Error('Empty AI response from provider');
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (e) {
      logger.error('Failed to parse AI JSON', { output: outputText });
      throw new Error('Invalid AI response format');
    }

    // Validation: Irrelevant documents are allowed to have null/missing summaries/analysis
    const isIrrelevant = parsed.relevance?.isRelevant === false;

    if (!isIrrelevant) {
      if (tier === 'free' && !parsed.freeSummary) {
        throw new Error('Invalid free-tier response: missing freeSummary');
      }

      if (tier !== 'free' && !parsed.analysis) {
        throw new Error(`Invalid ${tier}-tier response: missing analysis`);
      }
    }

    if (parsed.analysis) {
      parsed.analysis.detailedReview = this.normalizeDetailedReview(parsed.analysis.detailedReview);
    }

    return {
      ...parsed,
      aiResponse: {
        model: response.model,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0
      }
    };
  }

  /**
   * Parse comparison response
   */
  parseComparisonResponse(response) {
    // Concatenate all text fragments from the response
    let outputText = '';
    if (response.output && Array.isArray(response.output)) {
      response.output.forEach(msg => {
        if (msg.content && Array.isArray(msg.content)) {
          msg.content.forEach(part => {
            if (part.type === 'output_text' && part.text) {
              outputText += part.text;
            }
          });
        }
      });
    }

    // Fallback for older response formats if applicable
    if (!outputText && response.output_text) {
      outputText = response.output_text;
    }

    if (!outputText) {
      throw new Error('Empty comparison response');
    }

    const parsed = JSON.parse(outputText);

    if (!parsed.comparison) {
      throw new Error('Invalid comparison structure');
    }

    return {
      ...parsed,
      aiResponse: {
        model: response.model,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0
      }
    };
  }
}

module.exports = new AIOrchestrator();