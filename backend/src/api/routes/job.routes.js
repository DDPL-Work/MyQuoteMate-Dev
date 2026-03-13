// backend/src/api/routes/job.routes.js - SIMPLIFIED
const express = require('express');
const router = express.Router();
const multer = require('multer');
const JobController = require('../controllers/JobController');
const authMiddleware = require('../middleware/auth.middleware');

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Text, and image files (JPG, PNG, WEBP) are allowed'));
    }
  }
});

// Create job (upload PDF)
router.post(
  '/',
  authMiddleware.optionalAuth,
  upload.single('document'),
  JobController.createJob.bind(JobController)
);

// Get user's jobs
router.get(
  '/',
  authMiddleware.authenticate,
  JobController.getUserJobs.bind(JobController)
);

// Get single job
router.get(
  '/:jobId',
  authMiddleware.optionalAuth,
  JobController.getJob.bind(JobController)
);

// Get job status
router.get(
  '/:jobId/status',
  authMiddleware.optionalAuth,
  JobController.getJobStatus.bind(JobController)
);

// Get job result (analysis)
router.get(
  '/:jobId/result',
  authMiddleware.optionalAuth,
  JobController.getJobResult.bind(JobController)
);

// Delete job
router.delete(
  '/:jobId',
  authMiddleware.authenticate,
  JobController.deleteJob.bind(JobController)
);

// Download document
router.get(
  '/:jobId/documents/:documentId/download',
  authMiddleware.optionalAuth,
  JobController.downloadDocument
);

// Submit rating
router.patch(
  '/:jobId/rating',
  authMiddleware.optionalAuth,
  JobController.submitRating
);

// Compare multiple jobs (Premium)
router.post(
  '/compare',
  authMiddleware.optionalAuth,
  JobController.compareQuotes.bind(JobController)
);

// Generate Professional PDF Report
router.get(
  '/:jobId/report',
  authMiddleware.optionalAuth,
  JobController.generateReport.bind(JobController)
);

// Generate Professional Text Report (Word Style)
router.get(
  '/:jobId/text-report',
  authMiddleware.optionalAuth,
  JobController.generateTextReport.bind(JobController)
);

module.exports = router;