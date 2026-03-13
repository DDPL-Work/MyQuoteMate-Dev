// backend/src/api/controllers/JobController.js - UPDATED
const { v4: uuidv4 } = require('uuid');
const Job = require('../../models/Job');
const Document = require('../../models/Document');
const Lead = require('../../models/Lead');
const Result = require('../../models/Result');
const Supplier = require('../../models/Supplier');
const StorageService = require('../../services/storage/StorageService');
const OCRService = require('../../services/ocr/OCRService');
const AIOrchestrator = require('../../services/ai/AIOrchestrator');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const ReportService = require('../../services/report/ReportService');

class JobController {
  /**
   * Resolve job by UUID or ObjectId
   */
  async resolveJob(id) {
    if (!id) return null;
    let query = { deletedAt: null };

    // Check if it's a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [{ _id: id }, { jobId: id }];
    } else {
      query.jobId = id;
    }

    return await Job.findOne(query).populate('result').populate('documents').populate('userId').populate('leadId');
  }

  /**
   * Create a new job and upload document
   */
  async createJob(req, res, next) {
    try {
      let { email, tier = 'Free', metadata = {}, exhaust = false } = req.body;
      const file = req.file;

      // Handle FormData strings
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }
      const isExhaust = exhaust === true || exhaust === 'true';

      console.log('Upload request received:', { email, file: file?.originalname, user: req.user?._id, tier, isExhaust });

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // Check if email already exists in User model (for guest uploads)
      if (!req.user) {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
          accountStatus: { $ne: 'deleted' }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: 'Email already registered',
            message: 'This email is already associated with an account. Please sign in to continue.',
            code: 'EMAIL_EXISTS'
          });
        }
      }

      const allowedMimes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only PDF, Text, and image files (JPG, PNG, WEBP) are accepted'
        });
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File exceeds 10MB limit'
        });
      }

      const validLeadSources = new Set([
        'free_upload',
        'web_upload',
        'guest_upload',
        'landing_page',
        'referral',
        'other'
      ]);
      const normalizedSource = typeof metadata?.source === 'string'
        ? metadata.source.trim().toLowerCase()
        : '';
      const leadSource = validLeadSources.has(normalizedSource)
        ? normalizedSource
        : (req.user ? 'web_upload' : 'guest_upload');

      // Find or create lead
      let lead = await Lead.findOne({ email: email.toLowerCase() });
      if (!lead) {
        lead = await Lead.create({
          email: email.toLowerCase(),
          source: leadSource,
          isGuest: !req.user, // Mark as guest if no authenticated user
          guestUploadedAt: !req.user ? new Date() : undefined,
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            referrer: req.get('referer')
          }
        });
        logger.info(`New lead created: ${email} (guest: ${!req.user})`);
      } else if (!req.user && !lead.isGuest) {
        // Update existing lead to mark as guest
        lead.isGuest = true;
        lead.guestUploadedAt = new Date();
        await lead.save();
      }

      // Create job
      let jobTier = 'Free';
      let userId = req.user?._id;

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }

        // Check Quota / Credits
        logger.info(`Checking credits for user ${user._id}: Plan=${user.subscription.plan}, Credits=${user.subscription.credits}, ReportsUsed=${user.subscription.reportsUsed}`);

        if (user.subscription.credits > 0) {
          // Use Paid Credit
          user.subscription.credits -= 1;
          user.subscription.reportsUsed = (user.subscription.reportsUsed || 0) + 1;

          // Determine Tier (Premium or Standard)
          jobTier = user.subscription.plan === 'Premium' ? 'Premium' : 'Standard';

          // If no credits left, transition back to Free plan IMMEDIATELY
          if (user.subscription.credits === 0) {
            logger.info(`User ${user._id} used last credit. Downgrading to Free.`);
            user.subscription.plan = 'Free';
            user.subscription.reportsTotal = 1; // Revert to monthly free limit capacity
          }

          await user.save();
          logger.info(`Used 1 paid credit for user ${user._id} (${jobTier}). Remaining: ${user.subscription.credits}.`);

          // One-Shot Premium Enforcement (exhaust flag)
          if (isExhaust && user.subscription.plan === 'Premium') {
            logger.info(`Exhaust flag set. Draining remaining ${user.subscription.credits} credits for user ${user._id} and reverting to Free.`);
            user.subscription.credits = 0;
            user.subscription.plan = 'Free';
            user.subscription.reportsTotal = 1;
            await user.save();
          }
        } else {
          // Check Free Monthly Limit (1 per month)
          const now = new Date();
          const lastFreeReport = user.subscription.freeReportDate ? new Date(user.subscription.freeReportDate) : null;

          let canUseFree = true;
          if (lastFreeReport) {
            // Check if same month and year
            if (lastFreeReport.getMonth() === now.getMonth() && lastFreeReport.getFullYear() === now.getFullYear()) {
              canUseFree = false;
            }
          }

          if (!canUseFree) {
            return res.status(403).json({
              success: false,
              error: 'Monthly usage limit reached',
              nextAvailableDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
              message: 'Free tier is limited to 1 report per month. Please upgrade for more analysis.'
            });
          }

          // Mark free usage
          user.subscription.freeReportDate = now;
          user.subscription.reportsUsed = 1; // Used their 1 free report
          user.subscription.reportsTotal = 1;
          user.subscription.plan = 'Free'; // Ensure they are on Free plan
          await user.save();

          jobTier = 'Free';
          logger.info(`Used monthly free report for user ${user._id}`);
        }
      } else {
        // Guest User - Allow Free Tier for now
        jobTier = 'Free';
        logger.info(`Guest upload using email: ${email}`);
      }

      // Calculate expiration date based on tier
      const now = new Date();
      const retentionDays = jobTier === 'Free' ? 7 : 90;
      const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

      const jobPublicId = uuidv4();
      const job = await Job.create({
        jobId: jobPublicId,
        leadId: lead._id,
        userId: req.user?._id,
        tier: jobTier, // Use calculated tier
        status: 'pending',
        expiresAt, // Set expiration date
        processingSteps: [
          { step: 'upload', status: 'in_progress' },
          { step: 'extraction', status: 'pending' },
          { step: 'analysis', status: 'pending' }
        ],
        metadata: {
          ...metadata,
          filename: file.originalname,
          fileSize: file.size,
          uploadedAt: now
        }
      });

      logger.info(`Job created: ${jobPublicId} for ${email}`);

      // Link job to lead for guest users
      if (!req.user && lead) {
        if (!lead.linkedJobs) lead.linkedJobs = [];
        lead.linkedJobs.push(job._id);
        await lead.save();
        logger.info(`Job ${jobPublicId} linked to guest lead ${email}`);
      }

      try {
        // Upload file
        const uploadResult = await StorageService.uploadFile(file.buffer, {
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          jobId: jobPublicId,
          userId: req.user?._id?.toString()
        });

        logger.info(`File uploaded to storage: ${uploadResult.storageKey} `);

        // Create document
        const document = await Document.create({
          jobId: job._id,
          userId: req.user?._id,
          originalFilename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageKey: uploadResult.storageKey,
          checksumMD5: uploadResult.checksumMD5,
          checksumSHA256: uploadResult.checksumSHA256,
          extractionStatus: 'pending'
        });

        // Update job
        job.documents.push(document._id);
        await job.updateProcessingStep('upload', 'completed');
        await job.save();

        logger.info(`Document created: ${document._id} `);

        // Queue for production processing
        const { documentProcessingQueue } = require('../../config/queue');

        if (documentProcessingQueue) {
          await documentProcessingQueue.add('process-document', {
            jobId: job._id,
            documentId: document._id,
            tier: job.tier
          }, {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000
            },
            removeOnComplete: true
          });
          logger.info(`Job ${jobPublicId} queued for processing`);
        } else {
          logger.warn(`Redis queue not available.Falling back to inline processing for Job ${jobPublicId}`);

          // CRITICAL: The DocumentProcessor relies on 'aiAnalysisQueue'.
          // If Redis is down, that queue is also null.
          // We need a robust fallback that runs the WHOLE chain.

          this.runInlineFallback(job, document, file);
        }

        return res.status(201).json({
          success: true,
          data: {
            jobId: jobPublicId,
            status: job.status,
            tier: job.tier,
            createdAt: job.createdAt,
            message: 'File uploaded successfully, processing started'
          }
        });

      } catch (uploadError) {
        logger.error('File upload failed:', uploadError);
        job.status = 'failed';
        await job.save();

        return res.status(500).json({
          success: false,
          error: 'Failed to upload file to storage'
        });
      }
    } catch (error) {
      logger.error('Job creation failed:', error);
      next(error);
    }
  }

  /**
   * Get all jobs for logged-in user
   */
  async getUserJobs(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const jobs = await Job.find({
        userId: req.user._id,
        deletedAt: null
      })
        .sort({ createdAt: -1 })
        .populate('documents', 'originalFilename fileSize')
        .lean();

      // Format response
      const formattedJobs = jobs.map(job => ({
        id: job._id,
        jobId: job.jobId,
        status: job.status,
        tier: job.tier,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        documents: job.documents,
        processingSteps: job.processingSteps,
        metadata: job.metadata
      }));

      res.json({
        success: true,
        data: formattedJobs
      });
    } catch (error) {
      logger.error('Failed to fetch user jobs:', error);
      next(error);
    }
  }

  /**
   * Get single job
   */
  async getJob(req, res, next) {
    try {
      const job = await this.resolveJob(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      const jobUserId = job.userId?._id || job.userId;
      if (req.user && jobUserId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete job
   */
  async deleteJob(req, res, next) {
    try {
      const job = await Job.findOne({ jobId: req.params.jobId });
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      job.deletedAt = new Date();
      await job.save();

      res.json({
        success: true,
        message: 'Job deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(req, res, next) {
    try {
      const job = await this.resolveJob(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      res.json({
        success: true,
        data: {
          jobId: job.jobId,
          status: job.status,
          processingSteps: job.processingSteps,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job result (analysis)
   */
  async getJobResult(req, res, next) {
    try {
      const job = await this.resolveJob(req.params.jobId);

      logger.info(`getJobResult request for ${req.params.jobId}`, {
        jobFound: !!job,
        hasResult: !!job?.result,
        jobId: job?._id,
        status: job?.status
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      const jobUserId = job.userId?._id || job.userId;
      if (req.user && jobUserId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      if (!job.result) {
        // Fallback: Check if there's a result ID that failed to populate OR a result that exists but isn't linked
        const Result = require('../../models/Result');
        const fallbackResult = await Result.findOne({ jobId: job._id });

        logger.info(`Fallback result search for job ${job._id}`, { found: !!fallbackResult });

        if (fallbackResult) {
          // Auto-repair linkage
          job.result = fallbackResult._id;
          if (job.status !== 'completed') job.status = 'completed';
          await job.save();

          return res.json({
            success: true,
            data: fallbackResult
          });
        }

        return res.status(404).json({
          success: false,
          error: 'Result not available yet'
        });
      }

      res.json({
        success: true,
        data: job.result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download document
   */
  async downloadDocument(req, res, next) {
    try {
      const document = await Document.findById(req.params.documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Check access
      const job = await Job.findById(document.jobId);
      const jobUserId = job.userId?._id || job.userId;
      if (req.user && jobUserId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const signedUrl = await StorageService.getSignedUrl(document.storageKey);
      res.json({
        success: true,
        data: { url: signedUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit job rating
   */
  async submitRating(req, res, next) {
    try {
      const { rating } = req.body;
      const job = await this.resolveJob(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // If job has a userId, check it
      const jobUserId = job.userId?._id || job.userId;
      if (jobUserId && req.user && jobUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      job.rating = rating;
      await job.save();

      res.json({
        success: true,
        message: 'Rating submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Fallback method when Redis is unavailable
   * Re-implements the processing chain: OCR -> AI -> Result -> Email
   */
  async runInlineFallback(job, document, file) {
    setTimeout(async () => {
      try {
        logger.info(`Starting INLINE processing for job ${job._id}`);

        // 1. Extraction Phase
        await job.updateProcessingStep('extraction', 'in_progress');

        const ocrService = require('../../services/ocr/OCRService');
        const AIOrchestrator = require('../../services/ai/AIOrchestrator');

        // 1. Text Extraction
        let extractionResult = { text: '' };
        try {
          if (file.mimetype === 'text/plain') {
            extractionResult = {
              text: file.buffer.toString('utf8'),
              ocrRequired: false,
              method: 'text_input'
            };
          } else {
            extractionResult = await ocrService.extractText(file.buffer, file.mimetype);
          }
          logger.info('Text extracted (inline)', {
            length: extractionResult?.text?.length,
            method: extractionResult?.method
          });
        } catch (e) {
          logger.error(`Extraction failed for job ${job._id}`, e);
          // Continue to allow fallback check
        }

        // Handle Fallback to Vision (e.g. Scanned Scanned PDF)
        let imageUrl = null;
        let textToAnalyze = extractionResult?.text || "";
        let ocrMetadata = {
          method: extractionResult?.method,
          ocrConfidence: extractionResult?.ocrConfidence
        };

        if (extractionResult?.fallbackToVision) {
          logger.info('OCR failed or scanned PDF detected. Falling back to Vision API.');
          // Generate preview URL from storage key (Cloudinary)
          // Document object from earlier scope?? 
          // Wait, 'document' is passed in runInlineFallback arguments
          if (document && document.storageKey) {
            const storageService = require('../../services/storage/StorageService');
            imageUrl = storageService.getPreviewUrl(document.storageKey);
            logger.info('Generated Vision Preview URL', { imageUrl });
            textToAnalyze = "Please analyze this attached image of the quote document.";
          }
        }

        // Check text limit (only if not using Vision? No, apply limit to text part anyway)
        const limits = { Free: 7000, Standard: 20000, Premium: 40000 };
        const limit = limits[job.tier] || 7000;

        const cappedText = textToAnalyze.length > limit
          ? textToAnalyze.slice(0, limit)
          : textToAnalyze;

        if (textToAnalyze.length > limit) {
          logger.warn('AI input truncated', { tier: job.tier, originalLength: textToAnalyze.length, allowed: limit });
        }

        if (!cappedText && !imageUrl) {
          throw new Error(`Insufficient text extracted or no image for analysis.`);
        }

        await job.updateProcessingStep('extraction', 'completed');

        // 2. AI Phase
        await job.updateProcessingStep('analysis', 'in_progress');
        logger.info(`Starting AI analysis for job ${job._id}(${cappedText.length} chars)`);

        // Pass imageUrl if available
        const aiOutcome = await AIOrchestrator.analyzeQuote(
          cappedText,
          job.tier.toLowerCase(),
          { ...job.metadata, ...ocrMetadata },
          imageUrl // Pass imageUrl to AIOrchestrator
        );

        // 3. Result
        const aiProcessor = require('../../workers/processors/aiProcessor');
        // CRITICAL: job.data is NOT populated here because it's not a Bull job!
        // The aiProcessor.createResult expects job.data.extractedText.
        // Shim job to have .data for the processor
        const jobShim = {
          _id: job._id,
          userId: job.userId,
          data: {
            extractedText: cappedText,
            extractionMethod: ocrMetadata.method,
            ocrConfidence: ocrMetadata.ocrConfidence,
            ...job.metadata
          }
        };

        const result = await aiProcessor.createResult(jobShim, aiOutcome, job.tier);

        // 3.1 Update Supplier Scoreboard
        if (aiOutcome.supplierScoreboardData) {
          const SupplierScoringService = require('../../services/supplier/SupplierScoringService');
          await SupplierScoringService.processSupplierQuote(
            job._id,
            {
              ...aiOutcome.supplierScoreboardData,
              rawText: cappedText
            }
          ).catch(err => logger.error('Inline Supplier scoring failed:', err));
        }

        job.result = result._id;
        job.status = 'completed';
        await job.updateProcessingStep('analysis', 'completed');
        await job.save();

        logger.info(`Inline job ${job._id} completed successfully`);

        // 4. Email
        try {
          const EmailService = require('../../services/email/EmailService');
          const user = await User.findById(job.userId);
          if (user?.email) {
            await EmailService.sendJobCompletionEmail(user, job);
          }
        } catch (e) { logger.warn('Email failed', e); }

      } catch (error) {
        logger.error(`Inline job failed: ${job._id} `, error);
        job.status = 'failed';
        await job.updateProcessingStep('analysis', 'failed', error.message);
        await job.save();
      }
    }, 100);
  }

  /**
   * Generate professional PDF report for Standard/Premium users
   */
  async generateReport(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await this.resolveJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      // 1. Ownership check (Allow if lead job OR if user matches)
      const jobUserId = job.userId?._id || job.userId;
      if (req.user && jobUserId && jobUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to access this report.'
        });
      }

      // 2. Tier Check (Allow if job is Standard/Premium OR if user has Standard/Premium subscription)
      const isJobPremium = ['standard', 'premium'].includes(job.tier.toLowerCase());
      const isUserPremium = req.user && ['Standard', 'Premium'].includes(req.user.subscription?.plan);

      if (!isJobPremium && !isUserPremium) {
        return res.status(403).json({
          success: false,
          error: 'PDF reports are a premium feature',
          message: 'Please upgrade to Standard or Premium to download professional reports.'
        });
      }

      if (!job.result) {
        return res.status(404).json({
          success: false,
          error: 'Analysis result not found',
          message: 'The analysis result for this job is not yet available. Please wait for processing to complete.'
        });
      }

      const effectiveTier = isUserPremium ? req.user.subscription.plan.toLowerCase() : job.tier.toLowerCase();
      const pdfBuffer = await ReportService.generateProfessionalReport(job, job.result, effectiveTier);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename = Analysis_Report_${jobId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);

    } catch (error) {
      logger.error('Failed to generate report:', error);
      res.status(500).json({ success: false, error: 'Failed to generate PDF report' });
    }
  }

  /**
   * Generate professional text-only report (Word Docs style)
   */
  async generateTextReport(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await this.resolveJob(jobId);

      if (!job || !job.result) {
        return res.status(404).json({ success: false, error: 'Job or result not found' });
      }

      // Tier check (Premium Only for this format)
      if (job.tier.toLowerCase() !== 'premium') {
        return res.status(403).json({
          success: false,
          error: 'Technical reports are a Premium feature'
        });
      }

      const pdfBuffer = await ReportService.generateProfessionalTextReport(job, job.result, 'premium');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Technical_Report_${jobId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to generate text report:', error);
      res.status(500).json({ success: false, error: 'Failed to generate technical report' });
    }
  }

  /**
   * Compare multiple quotes (Premium)
   */
  async compareQuotes(req, res, next) {
    try {
      const { jobIds } = req.body;
      if (!jobIds || !Array.isArray(jobIds) || jobIds.length < 2 || jobIds.length > 3) {
        return res.status(400).json({
          success: false,
          error: 'At least two and at most three quotations are required for comparison'
        });
      }

      // 1. Fetch all jobs and their results
      const jobs = await Job.find({ jobId: { $in: jobIds } }).populate('result');

      if (jobs.length < jobIds.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more jobs not found'
        });
      }

      // 2. Security: Check ownership for all jobs
      if (req.user) {
        const unauthorized = jobs.some(job => {
          const jobUserId = job.userId?._id || job.userId;
          return jobUserId && jobUserId.toString() !== req.user._id.toString();
        });
        if (unauthorized) {
          return res.status(403).json({ success: false, error: 'Access denied: One or more jobs do not belong to you' });
        }
      }

      const normalizeText = (value) => {
        if (typeof value !== 'string') return '';
        const cleaned = value.replace(/\s+/g, ' ').trim();
        if (!cleaned || /^["'`]+$/.test(cleaned) || cleaned.toLowerCase() === 'not provided') return '';
        return cleaned;
      };

      const deriveResultCost = (resultDoc) => {
        if (!resultDoc) return 0;
        if (Number.isFinite(resultDoc.overallCost)) return resultDoc.overallCost;
        if (Array.isArray(resultDoc.costBreakdown)) {
          return resultDoc.costBreakdown.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);
        }
        return 0;
      };

      const buildFallbackComparison = (results) => {
        const quotes = results.map((r, idx) => ({
          index: idx,
          name: r.name || `Quote ${idx + 1}`,
          cost: Number(r.cost) || 0,
          strengths: [
            `Estimated total: $${(Number(r.cost) || 0).toLocaleString()} AUD`,
            (r.redFlagsCount || 0) === 0
              ? 'No major red flags detected in available analysis.'
              : `${r.redFlagsCount} risk flag(s) identified for follow-up.`
          ],
          weaknesses: [
            (r.redFlagsCount || 0) > 0
              ? `${r.redFlagsCount} flagged risks require clarification before approval.`
              : 'Validate scope inclusions and exclusions with the contractor.'
          ]
        }));

        const maxCost = Math.max(1, ...results.map(r => Number(r.cost) || 0));
        const maxFlags = Math.max(1, ...results.map(r => Number(r.redFlagsCount) || 0));

        const winnerIndex = results.reduce((bestIdx, r, idx) => {
          const best = results[bestIdx];
          const bestScore = ((Number(best.cost) || 0) / maxCost) * 0.65 + ((Number(best.redFlagsCount) || 0) / maxFlags) * 0.35;
          const currentScore = ((Number(r.cost) || 0) / maxCost) * 0.65 + ((Number(r.redFlagsCount) || 0) / maxFlags) * 0.35;
          return currentScore < bestScore ? idx : bestIdx;
        }, 0);

        const cheapest = results.reduce((a, b) => ((Number(a.cost) || 0) <= (Number(b.cost) || 0) ? a : b), results[0]);
        const mostExpensive = results.reduce((a, b) => ((Number(a.cost) || 0) >= (Number(b.cost) || 0) ? a : b), results[0]);
        const spread = Math.max(0, (Number(mostExpensive.cost) || 0) - (Number(cheapest.cost) || 0));

        return {
          quotes,
          winner: {
            index: winnerIndex,
            reason: `${results[winnerIndex].name} currently shows the strongest cost-to-risk balance based on extracted totals and detected risk flags. Confirm scope details before final approval.`
          },
          betterApproach: `${results[winnerIndex].name} appears to be the most balanced technical choice when cost and identified risk indicators are considered together.`,
          relativePricing: `Price spread across submitted quotes is $${spread.toLocaleString()} AUD.`,
          valueAssessment: `${results[winnerIndex].name} is presently the strongest value candidate from available comparison data.`,
          keyDifferences: [
            `Lowest cost: ${cheapest.name} ($${(Number(cheapest.cost) || 0).toLocaleString()}).`,
            `Highest cost: ${mostExpensive.name} ($${(Number(mostExpensive.cost) || 0).toLocaleString()}).`,
            `Total spread between highest and lowest quote: $${spread.toLocaleString()} AUD.`
          ],
          disclaimer: 'Comparison is informational and based on extracted quote data.'
        };
      };

      const sanitizeComparison = (incomingComparison, results) => {
        const fallback = buildFallbackComparison(results);
        const incoming = incomingComparison || {};

        const quotes = results.map((r, idx) => {
          const sourceQuote = Array.isArray(incoming.quotes)
            ? incoming.quotes.find(q => Number(q?.index) === idx) || incoming.quotes[idx]
            : null;
          const strengths = Array.isArray(sourceQuote?.strengths)
            ? sourceQuote.strengths.map(normalizeText).filter(Boolean).slice(0, 5)
            : [];
          const weaknesses = Array.isArray(sourceQuote?.weaknesses)
            ? sourceQuote.weaknesses.map(normalizeText).filter(Boolean).slice(0, 5)
            : [];

          return {
            index: idx,
            name: normalizeText(sourceQuote?.name) || r.name || `Quote ${idx + 1}`,
            cost: Number.isFinite(sourceQuote?.cost) ? Number(sourceQuote.cost) : (Number(r.cost) || 0),
            strengths: strengths.length ? strengths : fallback.quotes[idx].strengths,
            weaknesses: weaknesses.length ? weaknesses : fallback.quotes[idx].weaknesses
          };
        });

        const incomingWinnerIndex = Number.isInteger(incoming?.winner?.index)
          ? incoming.winner.index
          : fallback.winner.index;
        const winnerIndex = incomingWinnerIndex >= 0 && incomingWinnerIndex < results.length
          ? incomingWinnerIndex
          : fallback.winner.index;

        const keyDifferences = Array.isArray(incoming.keyDifferences)
          ? incoming.keyDifferences.map(normalizeText).filter(Boolean).slice(0, 7)
          : [];

        return {
          quotes,
          winner: {
            index: winnerIndex,
            reason: normalizeText(incoming?.winner?.reason) || fallback.winner.reason
          },
          betterApproach: normalizeText(incoming.betterApproach) || fallback.betterApproach,
          relativePricing: normalizeText(incoming.relativePricing) || fallback.relativePricing,
          valueAssessment: normalizeText(incoming.valueAssessment) || fallback.valueAssessment,
          keyDifferences: keyDifferences.length ? keyDifferences : fallback.keyDifferences,
          disclaimer: normalizeText(incoming.disclaimer) || fallback.disclaimer
        };
      };

      // 3. Extract rich result content for AI comparison
      const processedResults = jobs.filter(j => j.result).map(j => {
        const resultDoc = j.result;
        const redFlagsCount = Array.isArray(resultDoc.redFlags) ? resultDoc.redFlags.length : 0;
        const rawText = [
          resultDoc.summary,
          resultDoc.detailedReview,
          Array.isArray(resultDoc.redFlags)
            ? resultDoc.redFlags.map(flag => `${flag.title || ''}: ${flag.description || ''}`).join('\n')
            : ''
        ].filter(Boolean).join('\n\n');

        return {
          jobId: j.jobId,
          name: j.metadata?.title || `Quote ${j.jobId}`,
          cost: deriveResultCost(resultDoc),
          redFlagsCount,
          rawText
        };
      });

      if (processedResults.length < 2) {
        return res.status(400).json({ success: false, error: 'Detailed results missing for one or more jobs' });
      }

      // 4. Call AI to compare, with deterministic fallback for production reliability
      const AIOrchestrator = require('../../services/ai/AIOrchestrator');
      let comparisonData;
      try {
        comparisonData = await AIOrchestrator.compareQuotes(processedResults, {
          workCategory: jobs[0].metadata?.workCategory
        });
      } catch (aiError) {
        logger.warn('AI comparison failed, using deterministic fallback', {
          error: aiError.message,
          jobIds
        });
        comparisonData = {
          comparison: buildFallbackComparison(processedResults),
          aiResponse: {
            model: 'rule_based_fallback',
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
          }
        };
      }

      const normalizedComparison = sanitizeComparison(comparisonData?.comparison, processedResults);

      // 4.1 Persist comparison data back to results
      await Promise.all(jobs.map(async (job) => {
        if (job.result) {
          job.result.quoteComparison = normalizedComparison;
          await job.result.save();
          logger.info(`Comparison data persisted to Result ${job.result._id} for Job ${job.jobId}`);
        }
      }));

      // 5. Premium Credit Enforcement: Drain remaining credits and revert to Free
      if (req.user) {
        const user = await User.findById(req.user._id);
        if (user && user.subscription.plan === 'Premium') {
          logger.info(`Comparison performed. Draining remaining ${user.subscription.credits} credits for user ${user._id} and reverting to Free.`);
          user.subscription.credits = 0;
          user.subscription.plan = 'Free';
          user.subscription.reportsTotal = 1;
          await user.save();
        }
      }

      res.json({
        success: true,
        data: {
          jobIds,
          ...comparisonData,
          comparison: normalizedComparison
        }
      });
    } catch (error) {
      logger.error('Comparison error:', error);
      res.status(500).json({ success: false, error: 'Failed to compare quotes' });
    }
  }
}

module.exports = new JobController();
