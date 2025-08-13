const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'participant', 'agent'],
    default: 'participant'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const tourLocationSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  coordinates: {
    x: Number,
    y: Number,
    z: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const tourChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['message', 'system', 'annotation'],
    default: 'message'
  },
  coordinates: {
    x: Number,
    y: Number,
    room: String
  }
});

const tourSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  scheduledTime: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in minutes
    default: 60
  },
  
  type: {
    type: String,
    enum: ['virtual', 'in-person', 'hybrid'],
    default: 'virtual'
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  participants: [participantSchema],
  
  maxParticipants: {
    type: Number,
    default: 10
  },
  
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  accessCode: String,
  
  currentLocation: {
    room: String,
    controlledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  locationHistory: [tourLocationSchema],
  
  chat: [tourChatSchema],
  
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    isPrivate: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  recording: {
    enabled: {
      type: Boolean,
      default: false
    },
    url: String,
    duration: Number
  },
  
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
tourSchema.index({ property: 1 });
tourSchema.index({ host: 1 });
tourSchema.index({ scheduledTime: 1 });
tourSchema.index({ status: 1 });
tourSchema.index({ 'participants.user': 1 });

// Methods
tourSchema.methods.addParticipant = function(userId, role = 'participant') {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Tour is at maximum capacity');
  }
  
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({ user: userId, role });
  }
  
  return this.save();
};

tourSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
  }
  
  return this.save();
};

tourSchema.methods.addChatMessage = function(userId, message, type = 'message', coordinates = null) {
  this.chat.push({
    user: userId,
    message,
    type,
    coordinates
  });
  
  return this.save();
};

module.exports = mongoose.model('Tour', tourSchema);