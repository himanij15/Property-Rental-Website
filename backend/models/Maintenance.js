const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'hvac', 'general', 'appliance', 'exterior', 'interior', 'landscaping']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contractor: {
    name: String,
    company: String,
    phone: String,
    email: String,
    license: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  dueDate: Date,
  scheduledDate: Date,
  completedDate: Date,
  
  images: [{
    url: String,
    description: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  documents: [{
    url: String,
    name: String,
    type: {
      type: String,
      enum: ['quote', 'invoice', 'receipt', 'warranty', 'permit', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  updates: [{
    message: String,
    status: String,
    cost: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  warranty: {
    duration: Number, // in months
    provider: String,
    terms: String,
    expiresAt: Date
  },
  
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'semi-annually', 'annually']
    },
    nextDue: Date
  }
}, {
  timestamps: true
});

// Indexes
maintenanceTaskSchema.index({ property: 1 });
maintenanceTaskSchema.index({ createdBy: 1 });
maintenanceTaskSchema.index({ assignedTo: 1 });
maintenanceTaskSchema.index({ status: 1 });
maintenanceTaskSchema.index({ priority: 1 });
maintenanceTaskSchema.index({ dueDate: 1 });
maintenanceTaskSchema.index({ category: 1 });

const MaintenanceTask = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

// Property Maintenance Schedule Schema
const maintenanceScheduleSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  schedule: [{
    task: String,
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'hvac', 'general', 'appliance', 'exterior', 'interior', 'landscaping']
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'semi-annually', 'annually']
    },
    nextDue: Date,
    lastCompleted: Date,
    cost: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  contractors: [{
    name: String,
    company: String,
    phone: String,
    email: String,
    specialties: [String],
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    isPreferred: {
      type: Boolean,
      default: false
    }
  }],
  
  budget: {
    annual: Number,
    spent: {
      type: Number,
      default: 0
    },
    remaining: Number
  },
  
  emergencyContacts: [{
    name: String,
    service: String,
    phone: String,
    available24h: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes
maintenanceScheduleSchema.index({ property: 1 });
maintenanceScheduleSchema.index({ owner: 1 });

const MaintenanceSchedule = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);

module.exports = {
  MaintenanceTask,
  MaintenanceSchedule
};