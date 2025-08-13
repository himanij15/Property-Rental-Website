const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// File upload configuration for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('savedProperties', 'title pricing.listPrice media.images location.address features.bedrooms features.bathrooms features.sqft');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('preferences.propertyType').optional().isArray().withMessage('Property type must be an array'),
  body('preferences.priceRange.min').optional().isNumeric().withMessage('Minimum price must be a number'),
  body('preferences.priceRange.max').optional().isNumeric().withMessage('Maximum price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };
    delete updateData.email; // Don't allow email updates through this endpoint
    delete updateData.password; // Don't allow password updates through this endpoint
    delete updateData.role; // Don't allow role updates

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('savedProperties', 'title pricing.listPrice media.images location.address features.bedrooms features.bathrooms features.sqft');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Upload user avatar
router.post('/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      user
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's saved properties
router.get('/saved-properties', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'savedProperties',
        populate: {
          path: 'listingAgent',
          select: 'name email phone avatar'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      properties: user.savedProperties
    });
  } catch (error) {
    console.error('Get saved properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add property to saved list
router.post('/saved-properties/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (user.savedProperties.includes(req.params.propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Property already in saved list'
      });
    }

    user.savedProperties.push(req.params.propertyId);
    await user.save();

    // Also update property favorites
    await property.toggleFavorite(req.user.userId);

    res.json({
      success: true,
      message: 'Property added to saved list'
    });
  } catch (error) {
    console.error('Add saved property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove property from saved list
router.delete('/saved-properties/:propertyId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    user.savedProperties = user.savedProperties.filter(id => id.toString() !== req.params.propertyId);
    await user.save();

    // Also update property favorites
    const property = await Property.findById(req.params.propertyId);
    if (property) {
      await property.toggleFavorite(req.user.userId);
    }

    res.json({
      success: true,
      message: 'Property removed from saved list'
    });
  } catch (error) {
    console.error('Remove saved property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user preferences
router.put('/preferences', [
  auth,
  body('propertyType').optional().isArray().withMessage('Property type must be an array'),
  body('priceRange.min').optional().isNumeric().withMessage('Minimum price must be a number'),
  body('priceRange.max').optional().isNumeric().withMessage('Maximum price must be a number'),
  body('location.city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isNumeric({ min: 0 }).withMessage('Bathrooms must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's viewing history
router.get('/viewing-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'viewingHistory.property',
        select: 'title location.address media.images pricing.listPrice features.bedrooms features.bathrooms features.sqft',
        populate: {
          path: 'listingAgent',
          select: 'name avatar'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      viewingHistory: user.viewingHistory.sort((a, b) => 
        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      )
    });
  } catch (error) {
    console.error('Get viewing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add property to viewing history
router.post('/viewing-history/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const user = await User.findById(req.user.userId);
    
    // Remove existing entry if it exists
    user.viewingHistory = user.viewingHistory.filter(
      item => item.property.toString() !== req.params.propertyId
    );
    
    // Add new entry at the beginning
    user.viewingHistory.unshift({
      property: req.params.propertyId,
      source: req.body.source || 'direct'
    });

    // Keep only last 50 entries
    if (user.viewingHistory.length > 50) {
      user.viewingHistory = user.viewingHistory.slice(0, 50);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Property added to viewing history'
    });
  } catch (error) {
    console.error('Add viewing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      savedProperties: user.savedProperties.length,
      viewingHistoryCount: user.viewingHistory.length,
      searchHistoryCount: user.searchHistory.length,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;