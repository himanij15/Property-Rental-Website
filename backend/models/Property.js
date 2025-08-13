const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' }
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  neighborhood: String,
  walkabilityScore: { type: Number, min: 0, max: 100 },
  transitScore: { type: Number, min: 0, max: 100 },
  bikeScore: { type: Number, min: 0, max: 100 }
});

const propertyFeaturesSchema = new mongoose.Schema({
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  sqft: { type: Number, required: true, min: 0 },
  lotSize: Number,
  yearBuilt: Number,
  propertyType: {
    type: String,
    required: true,
    enum: ['house', 'apartment', 'condo', 'townhouse', 'loft', 'duplex', 'studio']
  },
  style: String, // Ranch, Colonial, Modern, etc.
  floors: Number,
  parking: {
    spaces: { type: Number, default: 0 },
    type: { 
      type: String, 
      enum: ['garage', 'carport', 'street', 'lot', 'covered'],
      default: 'street'
    }
  },
  amenities: [String], // Pool, Gym, Balcony, etc.
  appliances: [String], // Washer, Dryer, Dishwasher, etc.
  petPolicy: {
    allowed: { type: Boolean, default: false },
    deposit: Number,
    restrictions: String
  }
});

const pricingSchema = new mongoose.Schema({
  listPrice: { type: Number, required: true, min: 0 },
  rent: Number, // for rental properties
  priceHistory: [{
    price: Number,
    date: { type: Date, default: Date.now },
    reason: String
  }],
  taxes: {
    annual: Number,
    perMonth: Number
  },
  hoa: {
    monthly: Number,
    amenities: [String]
  },
  utilities: {
    included: [String],
    estimated: Number
  }
});

const mediaSchema = new mongoose.Schema({
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
    room: String, // living room, kitchen, bedroom, etc.
    order: { type: Number, default: 0 }
  }],
  virtualTour: {
    url: String,
    provider: String, // matterport, etc.
    rooms: [{
      name: String,
      thumbnailUrl: String,
      panoramaUrl: String,
      coordinates: {
        x: Number,
        y: Number,
        z: Number
      }
    }]
  },
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  floorPlan: {
    url: String,
    rooms: [{
      name: String,
      coordinates: [[Number]] // polygon coordinates
    }]
  }
});

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: locationSchema,
  features: propertyFeaturesSchema,
  pricing: pricingSchema,
  media: mediaSchema,
  
  status: {
    type: String,
    required: true,
    enum: ['for-sale', 'for-rent', 'sold', 'rented', 'pending', 'off-market'],
    default: 'for-sale'
  },
  
  listingAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  featuredUntil: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  favorites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  inquiries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    phone: String,
    email: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'closed'],
      default: 'new'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI/ML fields
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  marketAnalysis: {
    priceEstimate: {
      low: Number,
      high: Number,
      current: Number
    },
    comparables: [{
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
      },
      similarity: Number,
      distance: Number
    }],
    daysOnMarket: Number,
    pricePerSqft: Number
  },
  
  neighborhoodData: {
    demographics: {
      avgAge: Number,
      families: Number,
      professionals: Number,
      students: Number
    },
    amenities: {
      restaurants: Number,
      cafes: Number,
      grocery: Number,
      schools: Number,
      parks: Number,
      hospitals: Number
    },
    safety: {
      crimeRate: Number,
      rating: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for search performance
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ 'location.address.city': 1, 'location.address.state': 1 });
propertySchema.index({ status: 1, isActive: 1 });
propertySchema.index({ 'pricing.listPrice': 1 });
propertySchema.index({ 'features.bedrooms': 1, 'features.bathrooms': 1 });
propertySchema.index({ 'features.propertyType': 1 });
propertySchema.index({ listingAgent: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ isFeatured: 1, featuredUntil: 1 });

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address.street': 'text',
  'location.address.city': 'text',
  'location.neighborhood': 'text'
});

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Method to increment views
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle favorite
propertySchema.methods.toggleFavorite = function(userId) {
  const existingFavorite = this.favorites.find(fav => fav.user.toString() === userId.toString());
  
  if (existingFavorite) {
    this.favorites = this.favorites.filter(fav => fav.user.toString() !== userId.toString());
  } else {
    this.favorites.push({ user: userId });
  }
  
  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);