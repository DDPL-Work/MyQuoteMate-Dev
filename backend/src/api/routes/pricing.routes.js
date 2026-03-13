const express = require('express');
const router = express.Router();
const Pricing = require('../../models/Pricing');
const { authenticate } = require('../middleware/auth.middleware');

// Role guard
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
    return next();
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Access check failed' });
  }
};

// Get all pricing tiers
router.get('/', async (req, res) => {
  try {
    const pricing = await Pricing.find({ isActive: true }).sort({ price: 1 });
    return res.json({ success: true, data: pricing });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch pricing' });
  }
});

// Admin: Get all pricing (including inactive)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const pricing = await Pricing.find().sort({ price: 1 });
    return res.json({ success: true, data: pricing });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch pricing' });
  }
});

// Admin: Create pricing tier
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, tier, price, description, features } = req.body;

    if (!name || !tier || price === undefined || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const pricing = new Pricing({
      name,
      tier,
      price: parseFloat(price),
      description,
      features: features || []
    });

    await pricing.save();
    return res.status(201).json({ success: true, data: pricing });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Tier already exists' });
    }
    return res.status(500).json({ success: false, error: 'Failed to create pricing' });
  }
});

// Admin: Update pricing tier
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, tier, price, description, features, isActive } = req.body;

    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(tier && { tier }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description && { description }),
        ...(features && { features }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );

    if (!pricing) {
      return res.status(404).json({ success: false, error: 'Pricing not found' });
    }

    return res.json({ success: true, data: pricing });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update pricing' });
  }
});

// Admin: Delete pricing tier
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);

    if (!pricing) {
      return res.status(404).json({ success: false, error: 'Pricing not found' });
    }

    return res.json({ success: true, message: 'Pricing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete pricing' });
  }
});

module.exports = router;
