// backend/src/api/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const authMiddleware = require('../middleware/auth.middleware');

// Get chat history
router.get(
  '/:jobId/chat',
  authMiddleware.authenticate,
  ChatController.getChatHistory
);

// Send message
router.post(
  '/:jobId/chat',
  authMiddleware.authenticate,
  ChatController.sendMessage
);

module.exports = router;