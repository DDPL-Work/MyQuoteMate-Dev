// backend/src/api/controllers/ChatController.js
const Job = require('../../models/Job');
const ChatMessage = require('../../models/ChatMessage');
const AIService = require('../../services/ai/AIService');
const logger = require('../../utils/logger');

class ChatController {
  // Get chat history for a job
  async getChatHistory(req, res, next) {
    try {
      const { jobId } = req.params;
      
      const messages = await ChatMessage.find({ jobId })
        .sort({ createdAt: 1 })
        .limit(50);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      logger.error('Get chat history failed:', error);
      next(error);
    }
  }

  // Send message to AI and get response
  async sendMessage(req, res, next) {
    try {
      const { jobId } = req.params;
      const { message, history = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Get job and result
      const job = await Job.findOne({ jobId })
        .populate('result')
        .populate('documents');

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      if (job.userId?.toString() !== req.user?._id?.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Save user message
      const userMessage = await ChatMessage.create({
        jobId: job._id,
        userId: req.user._id,
        message: message.trim(),
        sender: 'user'
      });

      // Get AI response
      const aiResponse = await AIService.chatAboutQuote({
        jobId: job._id,
        userMessage: message.trim(),
        quoteText: job.documents[0]?.extractedText || '',
        analysisResult: job.result?.analysis || {},
        chatHistory: history
      });

      // Save AI response
      const botMessage = await ChatMessage.create({
        jobId: job._id,
        userId: req.user._id,
        message: aiResponse.reply,
        sender: 'bot',
        metadata: {
          analysisUsed: aiResponse.analysisUsed,
          confidence: aiResponse.confidence
        }
      });

      res.json({
        success: true,
        data: {
          reply: aiResponse.reply,
          messageId: botMessage._id,
          analysisUsed: aiResponse.analysisUsed,
          confidence: aiResponse.confidence
        }
      });
    } catch (error) {
      logger.error('Chat message failed:', error);
      next(error);
    }
  }
}

module.exports = new ChatController();