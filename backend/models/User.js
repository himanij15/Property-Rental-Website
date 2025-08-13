const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userPreferencesSchema = new mongoose.Schema({
  propertyType: {
    type: [String],
    enum: ['house', 'apartment', 'condo', 'townhouse', 'loft'],
    default: []
  },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000000 }
  },
  location: {
    city: String,
    state: String,
    zipCode: String,
    radius: { type: Number, default: 25 } // miles
  },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  minSqft: Number,
  maxSqft: Number,
  amenities: [String],
  petFriendly: { type: Boolean, default: false },
  parking: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: userPreferencesSchema,
  savedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  viewingHistory: [{
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['search', 'recommendation', 'direct']
    }
  }],
  searchHistory: [{
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for search performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'preferences.location.city': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);