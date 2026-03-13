const express = require('express');
const router = express.Router();
const Discount = require('../../models/Discount');
const DiscountUsage = require('../../models/DiscountUsage');
const { authenticate } = require('../middleware/auth.middleware');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

// Role guard replaced by authenticateAdmin

// Public: Get all active discounts
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    }).select('code type value description startDate expiresAt applicableTiers');

    return res.json({ success: true, data: discounts });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch active discounts' });
  }
});

// Public: Validate discount code
router.post('/validate', async (req, res) => {
  try {
    const { code, tier, amount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Code required' });
    }

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discount) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    // Check expiry
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return res.status(400).json({ success: false, error: 'Discount expired' });
    }

    // Check max uses
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ success: false, error: 'Discount usage limit reached' });
    }

    // Check applicable tiers
    if (tier && discount.applicableTiers.length > 0 && !discount.applicableTiers.includes(tier)) {
      return res.status(400).json({ success: false, error: 'Discount not applicable for this tier' });
    }

    // Check minimum purchase amount
    if (amount && discount.minPurchaseAmount && amount < discount.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase amount: $${discount.minPurchaseAmount.toFixed(2)}`
      });
    }

    return res.json({
      success: true,
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        description: discount.description
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to validate discount' });
  }
});

// Admin: Get discount usage history
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const history = await DiscountUsage.find()
      .populate('userId', 'name email')
      .populate('discountId', 'code')
      .sort({ usedAt: -1 })
      .limit(50);

    return res.json({ success: true, data: history });
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch usage history' });
  }
});

// Admin: Get all discounts
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [discounts, total] = await Promise.all([
      Discount.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Discount.countDocuments()
    ]);

    return res.json({
      success: true,
      data: discounts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch discounts' });
  }
});

// Admin: Create discount
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { code, type, value, description, maxUses, expiresAt, minPurchaseAmount, applicableTiers } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const discount = new Discount({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      description,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : 0,
      applicableTiers: applicableTiers || ['standard', 'premium']
    });

    await discount.save();
    return res.status(201).json({ success: true, data: discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Discount code already exists' });
    }
    return res.status(500).json({ success: false, error: 'Failed to create discount' });
  }
});

// Admin: Update discount
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { code, type, value, description, maxUses, expiresAt, minPurchaseAmount, applicableTiers, isActive } = req.body;

    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      {
        ...(code && { code: code.toUpperCase() }),
        ...(type && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(description !== undefined && { description }),
        ...(maxUses !== undefined && { maxUses: maxUses ? parseInt(maxUses) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(minPurchaseAmount !== undefined && { minPurchaseAmount: parseFloat(minPurchaseAmount) || 0 }),
        ...(applicableTiers && { applicableTiers }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    return res.json({ success: true, data: discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Discount code already exists' });
    }
    return res.status(500).json({ success: false, error: 'Failed to update discount' });
  }
});

// Admin: Delete discount
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);

    if (!discount) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    return res.json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete discount' });
  }
});

module.exports = router;
