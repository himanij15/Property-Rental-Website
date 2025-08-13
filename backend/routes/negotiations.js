const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Negotiation = require('../models/Negotiation');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all negotiations for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter - user is buyer, seller, or agent
    const filter = {
      $or: [
        { buyer: req.user.userId },
        { seller: req.user.userId },
        { buyerAgent: req.user.userId },
        { sellerAgent: req.user.userId }
      ]
    };
    
    if (status) filter.status = status;
    
    const negotiations = await Negotiation.find(filter)
      .populate('property', 'title location.address media.images pricing.listPrice')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('buyerAgent', 'name email avatar')
      .populate('sellerAgent', 'name email avatar')
      .sort({ 'metadata.lastActivity': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalNegotiations = await Negotiation.countDocuments(filter);
    
    res.json({
      success: true,
      negotiations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNegotiations,
        pages: Math.ceil(totalNegotiations / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get negotiations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get negotiation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
      .populate('property')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('buyerAgent', 'name email avatar')
      .populate('sellerAgent', 'name email avatar')
      .populate('messages.sender', 'name avatar')
      .populate('messages.recipient', 'name avatar')
      .populate('offers.submittedBy', 'name avatar');
    
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }
    
    // Check if user has access to this negotiation
    const participants = negotiation.getParticipants();
    const hasAccess = participants.some(p => p.toString() === req.user.userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      negotiation
    });
  } catch (error) {
    console.error('Get negotiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new negotiation
router.post('/', [
  auth,
  body('property').notEmpty().withMessage('Property ID is required'),
  body('seller').optional().isMongoId().withMessage('Invalid seller ID'),
  body('buyerAgent').optional().isMongoId().withMessage('Invalid buyer agent ID'),
  body('sellerAgent').optional().isMongoId().withMessage('Invalid seller agent ID')
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
    
    // Check if negotiation already exists for this property and buyer
    const existingNegotiation = await Negotiation.findOne({
      property: req.body.property,
      buyer: req.user.userId,
      status: { $in: ['active', 'pending-acceptance'] }
    });
    
    if (existingNegotiation) {
      return res.status(400).json({
        success: false,
        message: 'Active negotiation already exists for this property'
      });
    }
    
    const negotiationData = {
      ...req.body,
      buyer: req.user.userId,
      seller: req.body.seller || property.owner || property.listingAgent
    };
    
    const negotiation = new Negotiation(negotiationData);
    await negotiation.save();
    
    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('property', 'title location.address media.images pricing.listPrice')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('buyerAgent', 'name email avatar')
      .populate('sellerAgent', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Negotiation created successfully',
      negotiation: populatedNegotiation
    });
  } catch (error) {
    console.error('Create negotiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add message to negotiation
router.post('/:id/messages', [
  auth,
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('type').optional().isIn(['message', 'offer', 'counter-offer', 'acceptance', 'rejection', 'document', 'system']).withMessage('Invalid message type')
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
    
    const negotiation = await Negotiation.findById(req.params.id);
    
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }
    
    // Check if user is a participant
    const participants = negotiation.getParticipants();
    const isParticipant = participants.some(p => p.toString() === req.user.userId);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Must be a negotiation participant to send messages'
      });
    }
    
    const messageData = {
      sender: req.user.userId,
      recipient: req.body.recipient,
      message: req.body.message,
      type: req.body.type || 'message',
      attachments: req.body.attachments || []
    };
    
    await negotiation.addMessage(messageData);
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Add negotiation message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add offer to negotiation
router.post('/:id/offers', [
  auth,
  body('amount').isNumeric({ min: 0 }).withMessage('Valid offer amount is required'),
  body('terms.closingDate').optional().isISO8601().withMessage('Valid closing date is required'),
  body('terms.financingType').optional().isIn(['cash', 'conventional', 'fha', 'va', 'usda', 'other']).withMessage('Invalid financing type'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiration date is required')
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
    
    const negotiation = await Negotiation.findById(req.params.id);
    
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }
    
    // Check if user can make offers (buyer or buyer's agent)
    const canMakeOffer = negotiation.buyer.toString() === req.user.userId ||
                        negotiation.buyerAgent?.toString() === req.user.userId;
    
    if (!canMakeOffer) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer or buyer agent can make offers'
      });
    }
    
    const offerData = {
      ...req.body,
      submittedBy: req.user.userId,
      expiresAt: req.body.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours default
    };
    
    await negotiation.addOffer(offerData);
    
    res.json({
      success: true,
      message: 'Offer submitted successfully'
    });
  } catch (error) {
    console.error('Add offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Respond to offer
router.post('/:id/offers/:offerId/respond', [
  auth,
  body('action').isIn(['accept', 'reject', 'counter']).withMessage('Invalid action'),
  body('counterOffer').optional().isObject().withMessage('Invalid counter offer data')
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
    
    const negotiation = await Negotiation.findById(req.params.id);
    
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }
    
    const offer = negotiation.offers.id(req.params.offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    // Check if user can respond to offers (seller or seller's agent)
    const canRespond = negotiation.seller?.toString() === req.user.userId ||
                      negotiation.sellerAgent?.toString() === req.user.userId;
    
    if (!canRespond) {
      return res.status(403).json({
        success: false,
        message: 'Only seller or seller agent can respond to offers'
      });
    }
    
    const { action, counterOffer } = req.body;
    
    if (action === 'accept') {
      offer.status = 'accepted';
      negotiation.status = 'accepted';
      
      // Add acceptance message
      await negotiation.addMessage({
        sender: req.user.userId,
        recipient: offer.submittedBy,
        message: `Offer of $${offer.amount.toLocaleString()} has been accepted!`,
        type: 'acceptance'
      });
      
    } else if (action === 'reject') {
      offer.status = 'rejected';
      
      // Add rejection message
      await negotiation.addMessage({
        sender: req.user.userId,
        recipient: offer.submittedBy,
        message: `Offer of $${offer.amount.toLocaleString()} has been rejected.`,
        type: 'rejection'
      });
      
    } else if (action === 'counter' && counterOffer) {
      offer.status = 'countered';
      
      // Add counter offer
      const counterOfferData = {
        ...counterOffer,
        submittedBy: req.user.userId,
        expiresAt: counterOffer.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000)
      };
      
      await negotiation.addOffer(counterOfferData);
      
      // Add counter offer message
      await negotiation.addMessage({
        sender: req.user.userId,
        recipient: offer.submittedBy,
        message: `Counter offer of $${counterOffer.amount.toLocaleString()} has been made.`,
        type: 'counter-offer'
      });
    }
    
    await negotiation.save();
    
    res.json({
      success: true,
      message: `Offer ${action}ed successfully`
    });
  } catch (error) {
    console.error('Respond to offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update negotiation status
router.patch('/:id/status', [
  auth,
  body('status').isIn(['active', 'pending-acceptance', 'accepted', 'rejected', 'expired', 'cancelled']).withMessage('Invalid status')
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
    
    const negotiation = await Negotiation.findById(req.params.id);
    
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }
    
    // Check if user is a participant
    const participants = negotiation.getParticipants();
    const isParticipant = participants.some(p => p.toString() === req.user.userId);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    negotiation.status = req.body.status;
    await negotiation.save();
    
    res.json({
      success: true,
      message: 'Negotiation status updated successfully'
    });
  } catch (error) {
    console.error('Update negotiation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;