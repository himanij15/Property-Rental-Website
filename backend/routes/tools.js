const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Split Rent Calculator
router.post('/split-rent', [
  auth,
  body('totalRent').isNumeric({ min: 0 }).withMessage('Total rent must be a positive number'),
  body('roommates').isArray({ min: 1 }).withMessage('At least one roommate is required'),
  body('roommates.*.name').trim().isLength({ min: 1 }).withMessage('Roommate name is required'),
  body('roommates.*.income').isNumeric({ min: 0 }).withMessage('Income must be a non-negative number'),
  body('roommates.*.roomSize').isIn(['small', 'medium', 'large', 'master']).withMessage('Invalid room size')
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

    const { totalRent, roommates } = req.body;

    // Calculate splits based on income and room size
    const roomSizeMultipliers = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
      master: 1.4
    };

    const totalIncome = roommates.reduce((sum, r) => sum + r.income, 0);
    const totalWeightedSize = roommates.reduce((sum, r) => sum + roomSizeMultipliers[r.roomSize], 0);

    if (totalIncome === 0) {
      // Equal split if no income data
      const splitAmount = totalRent / roommates.length;
      const splits = roommates.map(roommate => ({
        name: roommate.name,
        amount: Math.round(splitAmount),
        percentage: Math.round(100 / roommates.length),
        breakdown: {
          income: 0,
          roomSize: roommate.roomSize,
          baseAmount: Math.round(splitAmount)
        }
      }));

      return res.json({
        success: true,
        splits,
        method: 'equal',
        totalRent,
        totalAllocated: splits.reduce((sum, s) => sum + s.amount, 0)
      });
    }

    // Income and room size weighted split
    const splits = roommates.map(roommate => {
      const incomeWeight = roommate.income / totalIncome;
      const sizeWeight = roomSizeMultipliers[roommate.roomSize] / totalWeightedSize;
      const combinedWeight = (incomeWeight * 0.7) + (sizeWeight * 0.3); // 70% income, 30% room size
      
      const amount = Math.round(totalRent * combinedWeight);
      const percentage = Math.round(combinedWeight * 100);

      return {
        name: roommate.name,
        amount,
        percentage,
        breakdown: {
          income: roommate.income,
          incomePercentage: Math.round(incomeWeight * 100),
          roomSize: roommate.roomSize,
          roomSizeWeight: Math.round(sizeWeight * 100),
          baseAmount: amount
        }
      };
    });

    // Adjust for rounding errors
    const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0);
    const difference = totalRent - totalAllocated;
    if (difference !== 0) {
      // Add difference to the person with highest income
      const highestIncomeIndex = splits.findIndex(s => 
        s.breakdown.income === Math.max(...splits.map(s => s.breakdown.income))
      );
      splits[highestIncomeIndex].amount += difference;
    }

    res.json({
      success: true,
      splits,
      method: 'weighted',
      totalRent,
      totalAllocated: totalRent,
      factors: {
        incomeWeight: 70,
        roomSizeWeight: 30
      }
    });
  } catch (error) {
    console.error('Split rent calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Neighborhood Analysis
router.get('/neighborhood-analysis', [
  auth,
  query('address').trim().isLength({ min: 5 }).withMessage('Valid address is required')
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

    const { address } = req.query;

    // In a real implementation, you would call external APIs here
    // For now, we'll return mock data based on the address
    
    const mockData = {
      address,
      lastUpdated: new Date().toISOString(),
      walkabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      transitScore: Math.floor(Math.random() * 40) + 50, // 50-90
      bikeScore: Math.floor(Math.random() * 50) + 40, // 40-90
      
      demographics: {
        population: Math.floor(Math.random() * 50000) + 10000,
        medianAge: Math.floor(Math.random() * 20) + 25,
        medianIncome: Math.floor(Math.random() * 50000) + 40000,
        educationLevel: {
          highSchool: Math.floor(Math.random() * 30) + 20,
          college: Math.floor(Math.random() * 40) + 30,
          graduate: Math.floor(Math.random() * 25) + 10
        }
      },

      safety: {
        crimeRate: ['Very Low', 'Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], // Bias toward safer
        emergencyResponseTime: Math.floor(Math.random() * 5) + 3, // 3-8 minutes
        policeStations: Math.floor(Math.random() * 3) + 1,
        fireStations: Math.floor(Math.random() * 2) + 1
      },

      schools: [
        {
          name: `${['Lincoln', 'Washington', 'Roosevelt', 'Jefferson'][Math.floor(Math.random() * 4)]} Elementary`,
          type: 'Elementary',
          rating: (Math.random() * 3 + 7).toFixed(1), // 7.0-10.0
          distance: `${(Math.random() * 0.8 + 0.2).toFixed(1)} miles`,
          enrollment: Math.floor(Math.random() * 400) + 200
        },
        {
          name: `${['Central', 'North', 'South', 'East'][Math.floor(Math.random() * 4)]} High School`,
          type: 'High School',
          rating: (Math.random() * 3 + 6.5).toFixed(1), // 6.5-9.5
          distance: `${(Math.random() * 1.5 + 0.5).toFixed(1)} miles`,
          enrollment: Math.floor(Math.random() * 1000) + 500
        }
      ],

      amenities: {
        restaurants: Math.floor(Math.random() * 50) + 10,
        cafes: Math.floor(Math.random() * 20) + 5,
        groceryStores: Math.floor(Math.random() * 10) + 2,
        pharmacies: Math.floor(Math.random() * 5) + 1,
        gasStations: Math.floor(Math.random() * 8) + 2,
        banks: Math.floor(Math.random() * 10) + 3,
        gyms: Math.floor(Math.random() * 8) + 1,
        parks: Math.floor(Math.random() * 5) + 1,
        libraries: Math.floor(Math.random() * 3) + 1,
        hospitals: Math.floor(Math.random() * 2) + 1
      },

      transportation: {
        busRoutes: Math.floor(Math.random() * 8) + 2,
        subwayStations: Math.floor(Math.random() * 3),
        bikeShares: Math.floor(Math.random() * 5),
        averageCommute: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
        parkingAvailability: ['Limited', 'Moderate', 'Abundant'][Math.floor(Math.random() * 3)]
      },

      lifestyle: {
        nightlife: Math.floor(Math.random() * 10) + 1, // 1-10 scale
        familyFriendly: Math.floor(Math.random() * 10) + 1,
        petFriendly: Math.floor(Math.random() * 10) + 1,
        walkable: Math.floor(Math.random() * 10) + 1,
        quiet: Math.floor(Math.random() * 10) + 1
      },

      housingMarket: {
        averageRent: Math.floor(Math.random() * 1000) + 1200,
        averageHomePrice: Math.floor(Math.random() * 200000) + 300000,
        priceGrowth: (Math.random() * 10 - 2).toFixed(1), // -2% to 8%
        inventory: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        daysOnMarket: Math.floor(Math.random() * 30) + 15
      }
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Neighborhood analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// AR Furniture Items Catalog
router.get('/furniture-items', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    // Mock furniture catalog
    const allItems = [
      // Living Room
      { id: '1', name: 'Modern Sectional Sofa', category: 'living-room', price: 1299, dimensions: '108"W x 35"D x 32"H', style: 'modern' },
      { id: '2', name: 'Glass Coffee Table', category: 'living-room', price: 399, dimensions: '48"W x 24"D x 18"H', style: 'modern' },
      { id: '3', name: 'Leather Armchair', category: 'living-room', price: 799, dimensions: '32"W x 34"D x 30"H', style: 'contemporary' },
      { id: '4', name: 'TV Entertainment Center', category: 'living-room', price: 699, dimensions: '72"W x 18"D x 24"H', style: 'modern' },
      
      // Bedroom
      { id: '5', name: 'Platform Bed Frame', category: 'bedroom', price: 899, dimensions: '66"W x 86"D x 14"H', style: 'minimalist' },
      { id: '6', name: 'Nightstand Set', category: 'bedroom', price: 299, dimensions: '24"W x 16"D x 24"H', style: 'modern' },
      { id: '7', name: '6-Drawer Dresser', category: 'bedroom', price: 599, dimensions: '58"W x 18"D x 32"H', style: 'contemporary' },
      { id: '8', name: 'Upholstered Headboard', category: 'bedroom', price: 449, dimensions: '64"W x 4"D x 54"H', style: 'contemporary' },
      
      // Dining Room
      { id: '9', name: 'Dining Table', category: 'dining-room', price: 899, dimensions: '72"W x 36"D x 30"H', style: 'modern' },
      { id: '10', name: 'Dining Chairs (Set of 4)', category: 'dining-room', price: 599, dimensions: '18"W x 22"D x 32"H', style: 'modern' },
      { id: '11', name: 'Buffet Cabinet', category: 'dining-room', price: 799, dimensions: '60"W x 18"D x 32"H', style: 'contemporary' },
      
      // Office
      { id: '12', name: 'Executive Desk', category: 'office', price: 699, dimensions: '60"W x 30"D x 30"H', style: 'modern' },
      { id: '13', name: 'Ergonomic Office Chair', category: 'office', price: 399, dimensions: '26"W x 26"D x 42"H', style: 'modern' },
      { id: '14', name: 'Bookshelf', category: 'office', price: 299, dimensions: '32"W x 12"D x 72"H', style: 'minimalist' }
    ];

    let filteredItems = allItems;
    
    if (category) {
      filteredItems = allItems.filter(item => item.category === category);
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
      success: true,
      items: paginatedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredItems.length,
        pages: Math.ceil(filteredItems.length / parseInt(limit))
      },
      categories: ['living-room', 'bedroom', 'dining-room', 'office']
    });
  } catch (error) {
    console.error('Get furniture items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Save AR Furniture Layout
router.post('/furniture-layout', [
  auth,
  body('propertyId').notEmpty().withMessage('Property ID is required'),
  body('roomName').trim().isLength({ min: 1 }).withMessage('Room name is required'),
  body('layout').isArray().withMessage('Layout must be an array of furniture items'),
  body('layout.*.itemId').notEmpty().withMessage('Item ID is required for each furniture piece'),
  body('layout.*.position').isObject().withMessage('Position is required for each furniture piece')
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

    const { propertyId, roomName, layout, metadata } = req.body;

    // In a real implementation, you would save this to a database
    const savedLayout = {
      id: Date.now().toString(),
      userId: req.user.userId,
      propertyId,
      roomName,
      layout,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Mock save operation
    console.log('Saving furniture layout:', savedLayout);

    res.json({
      success: true,
      message: 'Furniture layout saved successfully',
      layoutId: savedLayout.id
    });
  } catch (error) {
    console.error('Save furniture layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get saved furniture layouts
router.get('/furniture-layouts', [
  auth,
  query('propertyId').optional().notEmpty().withMessage('Property ID cannot be empty')
], async (req, res) => {
  try {
    const { propertyId } = req.query;

    // In a real implementation, you would query the database
    // For now, return mock data
    const mockLayouts = [
      {
        id: '1',
        propertyId: propertyId || 'prop1',
        roomName: 'Living Room',
        layout: [
          { itemId: '1', position: { x: 0, y: 0, z: 0, rotation: 0 } },
          { itemId: '2', position: { x: 50, y: 0, z: 30, rotation: 0 } }
        ],
        metadata: { roomSize: { width: 200, height: 150 } },
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];

    let filteredLayouts = mockLayouts;
    if (propertyId) {
      filteredLayouts = mockLayouts.filter(layout => layout.propertyId === propertyId);
    }

    res.json({
      success: true,
      layouts: filteredLayouts
    });
  } catch (error) {
    console.error('Get furniture layouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;