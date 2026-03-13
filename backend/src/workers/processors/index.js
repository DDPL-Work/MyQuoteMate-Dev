// ============================================
// src/workers/processors/index.js
// ============================================
const documentProcessor = require('./documentProcessor');
const aiProcessor = require('./aiProcessor');
const emailProcessor = require('./emailProcessor');

module.exports = {
  documentProcessor,
  aiProcessor,
  emailProcessor
};