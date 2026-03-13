// ============================================
// src/services/ocr/OCRService.js
// ============================================
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const logger = require('../../utils/logger');

class OCRService {
  /**
   * Extract text from PDF or Text files
   */
  async extractText(buffer, mimeType) {
    try {
      if (mimeType === 'text/plain') {
        const text = buffer.toString('utf8').trim();
        return {
          text,
          ocrRequired: false,
          ocrConfidence: 100,
          method: 'text_input'
        };
      }

      // If it's an image, skip text extraction and go straight to Vision
      if (mimeType.startsWith('image/')) {
        logger.info(`Image detected (${mimeType}), using Vision fallback`);
        return {
          text: "",
          ocrRequired: true,
          fallbackToVision: true,
          method: 'vision_api'
        };
      }

      // Try text extraction first for PDFs
      let extractedText = '';
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text?.trim() || '';
      } catch (pdfError) {
        logger.warn('PDF parsing failed (corrupt or invalid format), will attempt Vision fallback:', pdfError.message);
        return {
          text: "",
          ocrRequired: true,
          fallbackToVision: true,
          method: 'fallback_placeholder'
        };
      }

      // If sufficient text found, return it
      if (extractedText && extractedText.length >= 100) {
        return {
          text: extractedText,
          ocrRequired: false,
          ocrConfidence: 100,
          method: 'text_extraction'
        };
      }

      // Otherwise, perform OCR
      logger.info('PDF appears to be scanned, performing OCR');
      return await this.performOCR(buffer);
    } catch (error) {
      logger.error('Extraction failed:', error);
      throw new Error(`Failed to extract text from ${mimeType.startsWith('image/') ? 'image' : (mimeType === 'application/pdf' ? 'PDF' : 'file')}`);
    }
  }

  // Legacy support
  async extractTextFromPDF(pdfBuffer) {
    return this.extractText(pdfBuffer, 'application/pdf');
  }

  /**
   * Perform OCR on scanned PDF
   */
  async performOCR(pdfBuffer) {
    const startTime = Date.now();
    const warnings = [];

    try {
      // Tesseract.js cannot read PDF buffers directly in Node without external tools (like pdftoppm).
      // Attempting to do so crashes the worker.
      // We will skip OCR for now if standard extraction failed, to prevent crash.

      return {
        text: "",
        ocrRequired: true,
        fallbackToVision: true,
        method: 'fallback_placeholder'
      };

      /* 
       // Original Code crashes on PDF buffer:
       const { data: { text, confidence } } = await Tesseract.recognize(
        pdfBuffer,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      ); */


      const processingTime = Date.now() - startTime;

      if (confidence < 60) {
        warnings.push('Low OCR confidence. Results may be inaccurate.');
      }

      return {
        text: text.trim(),
        ocrRequired: true,
        ocrConfidence: Math.round(confidence),
        method: 'tesseract_ocr',
        processingTime,
        warnings
      };
    } catch (error) {
      logger.error('OCR failed:', error);
      throw new Error('OCR processing failed');
    }
  }

  /**
   * Validate extracted text
   */
  validateExtractedText(text) {
    if (!text || typeof text !== 'string') {
      return {
        valid: false,
        reason: 'No text extracted'
      };
    }

    if (text.length < 50) {
      return {
        valid: false,
        reason: 'Insufficient text extracted'
      };
    }

    return {
      valid: true
    };
  }
}

module.exports = new OCRService();