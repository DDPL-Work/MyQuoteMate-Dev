// backend/src/api/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const AdminAuthController = require('../controllers/AdminAuthController');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

// Public Admin Auth Routes
router.post('/auth/login', AdminAuthController.login);
router.post('/auth/register', AdminAuthController.register);
router.post('/auth/refresh', AdminAuthController.refresh);

// Protected Admin Routes
router.use(authenticateAdmin);

router.get('/me', AdminController.getProfile);
router.put('/me', AdminController.updateProfile);

router.get('/stats', AdminController.getStats);
router.get('/revenue', AdminController.getRevenueStats);
router.get('/suppliers/stats', AdminController.getSupplierStats);
router.get('/suppliers', AdminController.getSuppliers);
router.get('/suppliers/:id', AdminController.getSupplierDetails);
router.get('/discounts/history', AdminController.getDiscountHistory);
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId', AdminController.updateUserStatus); // Added method for completeness
router.delete('/users/:userId', AdminController.banUser);      // Updated to Ban User

router.get('/payments', AdminController.getPayments);

router.get('/pricing', AdminController.getAdminPricing);
router.post('/pricing', AdminController.createPricing);
router.put('/pricing/:id', AdminController.updatePricing);
router.delete('/pricing/:id', AdminController.deletePricing);

module.exports = router;