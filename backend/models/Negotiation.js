const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  terms: {
    closingDate: Date,
    financingType: {
      type: String,
      enum: ['cash', 'conventional', 'fha', 'va', 'usda', 'other']
    },
    contingencies: [{
      type: {
        type: String,
        enum: ['inspection', 'financing', 'appraisal', 'sale-of-home', 'other']
      },
      description: String,
      deadline: Date
    }],
    downPayment: {
      amount: Number,
      percentage: Number
    },
    earnestMoney: Number,
    inspectionPeriod: Number, // days
    additionalTerms: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'withdrawn'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  responseBy: Date,
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pre-approval', 'proof-of-funds', 'contract', 'addendum', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'offer', 'counter-offer', 'acceptance', 'rejection', 'document', 'system'],
    default: 'message'
  },
  relatedOffer: {
    type: mongoose.Schema.Types.ObjectId
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const negotiationSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  buyerAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  sellerAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  status: {
    type: String,
    enum: ['active', 'pending-acceptance', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'active'
  },
  
  offers: [offerSchema],
  
  messages: [messageSchema],
  
  currentOffer: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  timeline: [{
    event: {
      type: String,
      enum: ['negotiation-started', 'offer-submitted', 'offer-countered', 'offer-accepted', 'offer-rejected', 'document-uploaded', 'inspection-scheduled', 'closing-scheduled']
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  metadata: {
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalOffers: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number // in minutes
  }
}, {
  timestamps: true
});

// Indexes
negotiationSchema.index({ property: 1 });
negotiationSchema.index({ buyer: 1 });
negotiationSchema.index({ seller: 1 });
negotiationSchema.index({ buyerAgent: 1 });
negotiationSchema.index({ sellerAgent: 1 });
negotiationSchema.index({ status: 1 });
negotiationSchema.index({ 'metadata.lastActivity': -1 });

// Methods
negotiationSchema.methods.addOffer = function(offerData) {
  this.offers.push(offerData);
  this.metadata.totalOffers += 1;
  this.metadata.lastActivity = new Date();
  this.currentOffer = this.offers[this.offers.length - 1]._id;
  
  // Add timeline event
  this.timeline.push({
    event: 'offer-submitted',
    description: `Offer submitted for $${offerData.amount.toLocaleString()}`,
    user: offerData.submittedBy
  });
  
  return this.save();
};

negotiationSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.metadata.totalMessages += 1;
  this.metadata.lastActivity = new Date();
  
  return this.save();
};

negotiationSchema.methods.getParticipants = function() {
  const participants = [this.buyer];
  
  if (this.seller) participants.push(this.seller);
  if (this.buyerAgent) participants.push(this.buyerAgent);
  if (this.sellerAgent) participants.push(this.sellerAgent);
  
  return participants;
};

module.exports = mongoose.model('Negotiation', negotiationSchema);