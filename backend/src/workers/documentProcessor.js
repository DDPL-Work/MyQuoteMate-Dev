// src/workers/processors/documentProcessor.js
const Job = require('../../models/Job');
const Document = require('../../models/Document');
const StorageService = require('../../services/storage/StorageService');
const OCRService = require('../../services/ocr/OCRService');
const { aiAnalysisQueue } = require('../../config/queue');
const logger = require('../../utils/logger');

class DocumentProcessor {
  async process(job) {
    const { jobId, documentId, tier } = job.data;

    try {
      logger.info(`Processing document ${documentId} for job ${jobId}`);

      const jobDoc = await Job.findById(jobId);
      const document = await Document.findById(documentId);

      if (!jobDoc || !document) {
        throw new Error('Job or document not found');
      }

      // Update status
      await jobDoc.updateProcessingStep('extraction', 'in_progress');

      // Download PDF from S3
      const pdfBuffer = await StorageService.downloadFile(document.storageKey);

      // Extract text
      const extractionResult = await OCRService.extractText(pdfBuffer, document.mimeType);

      // Validate
      const validation = OCRService.validateExtractedText(extractionResult.text);

      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Update document
      if (extractionResult.ocrRequired) {
        await document.completeOCR(
          extractionResult.text,
          extractionResult.ocrConfidence,
          {
            engine: 'tesseract',
            language: 'eng',
            processingTime: extractionResult.processingTime,
            warnings: extractionResult.warnings || []
          }
        );
      } else {
        document.extractedText = extractionResult.text;
        document.extractionStatus = 'completed';
        await document.save();
      }

      // Update job
      await jobDoc.updateProcessingStep('extraction', 'completed');

      // Queue for AI analysis
      let imageUrl = null;
      if (extractionResult.fallbackToVision) {
        imageUrl = StorageService.getPreviewUrl(document.storageKey);
        logger.info(`Vision fallback enabled for job ${jobId}. Preview URL: ${imageUrl}`);
      }

      await aiAnalysisQueue.add('analyze-quote', {
        jobId: jobId,
        documentId: documentId,
        extractedText: extractionResult.text || "Please analyze this attached image/scanned document.",
        tier: tier,
        ocrConfidence: extractionResult.ocrConfidence,
        extractionMethod: extractionResult.method,
        imageUrl: imageUrl
      }, {
        jobId: `ai-${jobId}`,
        attempts: 3
      });

      logger.info(`Document processed successfully: ${documentId}`);

      return {
        success: true,
        textLength: extractionResult.text.length,
        ocrRequired: extractionResult.ocrRequired
      };
    } catch (error) {
      logger.error(`Document processing failed for ${documentId}:`, error);

      const jobDoc = await Job.findById(jobId);
      if (jobDoc) {
        jobDoc.status = 'failed';
        await jobDoc.updateProcessingStep('extraction', 'failed', error.message);
      }

      throw error;
    }
  }
}

module.exports = new DocumentProcessor();