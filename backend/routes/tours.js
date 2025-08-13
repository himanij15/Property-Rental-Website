const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Tour = require('../models/Tour');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tours (user's tours)
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    // Build filter - user is either host or participant
    const filter = {
      $or: [
        { host: req.user.userId },
        { 'participants.user': req.user.userId }
      ]
    };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const tours = await Tour.find(filter)
      .populate('property', 'title location.address media.images pricing.listPrice')
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ scheduledTime: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalTours = await Tour.countDocuments(filter);
    
    res.json({
      success: true,
      tours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTours,
        pages: Math.ceil(totalTours / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get tour by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('property')
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('chat.user', 'name avatar');
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Check if user has access to this tour
    const isParticipant = tour.participants.some(p => p.user._id.toString() === req.user.userId);
    const isHost = tour.host._id.toString() === req.user.userId;
    
    if (!isParticipant && !isHost && !tour.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      tour
    });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new tour
router.post('/', [
  auth,
  body('property').notEmpty().withMessage('Property ID is required'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('type').isIn(['virtual', 'in-person', 'hybrid']).withMessage('Invalid tour type'),
  body('duration').optional().isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes')
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
    
    // Verify property exists
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const tourData = {
      ...req.body,
      host: req.user.userId,
      participants: [{
        user: req.user.userId,
        role: 'host'
      }]
    };
    
    // Generate access code for private tours
    if (req.body.isPrivate) {
      tourData.accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    const tour = new Tour(tourData);
    await tour.save();
    
    const populatedTour = await Tour.findById(tour._id)
      .populate('property', 'title location.address media.images')
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      tour: populatedTour
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Join tour
router.post('/:id/join', auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Check if tour is private and requires access code
    if (tour.isPrivate && req.body.accessCode !== tour.accessCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid access code'
      });
    }
    
    // Check if user is already a participant
    const existingParticipant = tour.participants.find(p => p.user.toString() === req.user.userId);
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Already a participant in this tour'
      });
    }
    
    await tour.addParticipant(req.user.userId);
    
    res.json({
      success: true,
      message: 'Successfully joined tour'
    });
  } catch (error) {
    console.error('Join tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Leave tour
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Host cannot leave their own tour
    if (tour.host.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Host cannot leave their own tour'
      });
    }
    
    await tour.removeParticipant(req.user.userId);
    
    res.json({
      success: true,
      message: 'Successfully left tour'
    });
  } catch (error) {
    console.error('Leave tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add chat message
router.post('/:id/messages', [
  auth,
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  body('type').optional().isIn(['message', 'system', 'annotation']).withMessage('Invalid message type')
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
    
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Check if user is a participant
    const isParticipant = tour.participants.some(p => p.user.toString() === req.user.userId && p.isActive);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Must be a tour participant to send messages'
      });
    }
    
    await tour.addChatMessage(
      req.user.userId,
      req.body.message,
      req.body.type || 'message',
      req.body.coordinates || null
    );
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Add tour message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update tour status
router.patch('/:id/status', [
  auth,
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
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
    
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Only host can update tour status
    if (tour.host.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only tour host can update status'
      });
    }
    
    tour.status = req.body.status;
    await tour.save();
    
    res.json({
      success: true,
      message: 'Tour status updated successfully',
      tour
    });
  } catch (error) {
    console.error('Update tour status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add feedback to tour
router.post('/:id/feedback', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
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
    
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Check if tour is completed
    if (tour.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only leave feedback for completed tours'
      });
    }
    
    // Check if user was a participant
    const wasParticipant = tour.participants.some(p => p.user.toString() === req.user.userId);
    if (!wasParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Must have participated in tour to leave feedback'
      });
    }
    
    // Check if user already left feedback
    const existingFeedback = tour.feedback.find(f => f.user.toString() === req.user.userId);
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted'
      });
    }
    
    tour.feedback.push({
      user: req.user.userId,
      rating: req.body.rating,
      comment: req.body.comment
    });
    
    await tour.save();
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Add tour feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;