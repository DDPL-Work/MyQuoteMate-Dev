// ============================================
// src/config/openai.js
// ============================================

/**
 * Required environment validation
 * Fail FAST in production if misconfigured
 */
if (!process.env.OPENAI_API_KEY) {
  throw new Error('[OpenAI Config] OPENAI_API_KEY is not set');
}

/**
 * Allowed models (explicit allow-list)
 * Prevents accidental deploy with unsupported models
 */
const ALLOWED_MODELS = [
  'gpt-5-nano',
  'gpt-5-mini',
  'gpt-4o',
  'gpt-4.1-mini'
];

const model = process.env.OPENAI_MODEL || 'gpt-5-nano';

if (!ALLOWED_MODELS.includes(model)) {
  throw new Error(
    `[OpenAI Config] Unsupported OPENAI_MODEL: ${model}`
  );
}

/**
 * Safe numeric parsing helpers
 */
const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * OpenAI Configuration
 * NOTE:
 * - Token limits are enforced per-tier in AIOrchestrator
 * - This file defines only global client behavior
 * - GPT-5 uses the Responses API
 */
module.exports = {
  /**
   * Authentication
   */
  apiKey: process.env.OPENAI_API_KEY,

  /**
   * Model selection
   * GPT-5-Nano recommended for production
   */
  model,

  /**
   * Sampling behavior
   * Lower = safer, more deterministic
   */
  temperature: parseNumber(process.env.OPENAI_TEMPERATURE, 0.3),

  /**
   * Network & reliability
   */
  timeout: parseNumber(process.env.OPENAI_TIMEOUT, 60_000), // ms
  maxRetries: parseNumber(process.env.OPENAI_MAX_RETRIES, 3),

  /**
   * Informational flags (used by orchestration layer)
   * GPT-5 JSON enforcement handled via text.format
   */
  capabilities: {
    responsesApi: true,
    jsonOutput: true
  }
};