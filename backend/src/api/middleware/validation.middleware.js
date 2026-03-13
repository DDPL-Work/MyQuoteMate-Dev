// ============================================
// src/api/middleware/validation.middleware.js
// ============================================

const Joi = require('joi');

// ─── Auth ───────────────────────────────────
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    isPhoneVerified: Joi.boolean().optional()
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.details.map(d => d.message) });
  }

  req.body = value;
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.details.map(d => d.message) });
  }

  req.body = value;
  next();
};

// ─── Job Creation ───────────────────────────
const validateJobCreation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    tier: Joi.string().valid('free', 'standard', 'premium').default('free'),
    metadata: Joi.object().optional()
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.details.map(d => d.message) });
  }

  req.body = value;
  next();
};

// ─── ✅ Payment Intent (THIS WAS MISSING) ────
const validatePaymentIntent = (req, res, next) => {
  const schema = Joi.object({
    jobId: Joi.string().allow(null, '').optional(),
    tier: Joi.string().lowercase().valid('standard', 'premium').required(),
    customerData: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      discountCode: Joi.string().allow(null, '').optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.details.map(d => d.message) });
  }

  req.body = value;
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateJobCreation,
  validatePaymentIntent
};
