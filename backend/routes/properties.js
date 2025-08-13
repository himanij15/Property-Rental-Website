const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all properties with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isNumeric().withMessage('Minimum price must be a number'),
  query('maxPrice').optional().isNumeric().withMessage('Maximum price must be a number'),
  query('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  query('bathrooms').optional().isNumeric({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  query('propertyType').optional().isIn(['house', 'apartment', 'condo', 'townhouse', 'loft', 'duplex', 'studio']).withMessage('Invalid property type')
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

    const {
      page = 1,
      limit = 12,
      search,
      city,
      state,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      status = 'for-sale',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 25
    } = req.query;

    // Build filter object
    const filter = {
      isActive: true,
      status
    };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filters
    if (city) filter['location.address.city'] = new RegExp(city, 'i');
    if (state) filter['location.address.state'] = new RegExp(state, 'i');

    // Geolocation filter
    if (lat && lng) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1609.34 // Convert miles to meters
        }
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter['pricing.listPrice'] = {};
      if (minPrice) filter['pricing.listPrice'].$gte = parseInt(minPrice);
      if (maxPrice) filter['pricing.listPrice'].$lte = parseInt(maxPrice);
    }

    // Property features
    if (bedrooms) filter['features.bedrooms'] = { $gte: parseInt(bedrooms) };
    if (bathrooms) filter['features.bathrooms'] = { $gte: parseFloat(bathrooms) };
    if (propertyType) filter['features.propertyType'] = propertyType;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const properties = await Property.find(filter)
      .populate('listingAgent', 'name email phone avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-inquiries -__v');

    const totalProperties = await Property.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / parseInt(limit));

    res.json({
      success: true,
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProperties,
        pages: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('listingAgent', 'name email phone avatar role')
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    await property.incrementViews();

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new property (agents and admins only)
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('location.address.street').notEmpty().withMessage('Street address is required'),
  body('location.address.city').notEmpty().withMessage('City is required'),
  body('location.address.state').notEmpty().withMessage('State is required'),
  body('location.address.zipCode').notEmpty().withMessage('ZIP code is required'),
  body('features.bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('features.bathrooms').isNumeric({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  body('features.sqft').isInt({ min: 1 }).withMessage('Square footage must be a positive integer'),
  body('features.propertyType').isIn(['house', 'apartment', 'condo', 'townhouse', 'loft', 'duplex', 'studio']).withMessage('Invalid property type'),
  body('pricing.listPrice').isNumeric({ min: 0 }).withMessage('List price must be a positive number')
], async (req, res) => {
  try {
    // Check if user is agent or admin
    const user = await User.findById(req.user.userId);
    if (!['agent', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only agents and admins can create properties'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const propertyData = req.body;
    propertyData.listingAgent = req.user.userId;

    // Geocode address (simplified - in production use a real geocoding service)
    if (!propertyData.location.coordinates) {
      propertyData.location.coordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
      };
    }

    const property = new Property(propertyData);
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('listingAgent', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: populatedProperty
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update property
router.put('/:id', [auth], async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property or is admin
    const user = await User.findById(req.user.userId);
    if (property.listingAgent.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('listingAgent', 'name email phone avatar');

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Toggle favorite property
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await property.toggleFavorite(req.user.userId);

    // Update user's saved properties
    const user = await User.findById(req.user.userId);
    const isFavorited = property.favorites.some(fav => fav.user.toString() === req.user.userId);
    
    if (isFavorited && !user.savedProperties.includes(property._id)) {
      user.savedProperties.push(property._id);
    } else if (!isFavorited) {
      user.savedProperties = user.savedProperties.filter(id => id.toString() !== property._id.toString());
    }
    
    await user.save();

    res.json({
      success: true,
      message: isFavorited ? 'Property added to favorites' : 'Property removed from favorites',
      isFavorited
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Upload property images
router.post('/:id/images', [auth, upload.array('images', 10)], async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property or is admin
    const user = await User.findById(req.user.userId);
    if (property.listingAgent.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    const images = req.files.map((file, index) => ({
      url: `/uploads/properties/${file.filename}`,
      alt: req.body.alts ? req.body.alts[index] : '',
      room: req.body.rooms ? req.body.rooms[index] : '',
      order: property.media.images.length + index,
      isPrimary: index === 0 && property.media.images.length === 0
    }));

    property.media.images.push(...images);
    await property.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images
    });

  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get similar properties
router.get('/:id/similar', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      isActive: true,
      status: property.status,
      'features.propertyType': property.features.propertyType,
      'location.address.city': property.location.address.city,
      'pricing.listPrice': {
        $gte: property.pricing.listPrice * 0.8,
        $lte: property.pricing.listPrice * 1.2
      }
    })
    .populate('listingAgent', 'name avatar')
    .limit(6)
    .select('title pricing.listPrice media.images location.address features.bedrooms features.bathrooms features.sqft views');

    res.json({
      success: true,
      properties: similarProperties
    });

  } catch (error) {
    console.error('Get similar properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;