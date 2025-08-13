const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { MaintenanceTask, MaintenanceSchedule } = require('../models/Maintenance');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get maintenance tasks
router.get('/', auth, async (req, res) => {
  try {
    const { property, status, priority, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {
      $or: [
        { createdBy: req.user.userId },
        { assignedTo: req.user.userId }
      ]
    };
    
    if (property) filter.property = property;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Execute query with pagination
    const tasks = await MaintenanceTask.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('property', 'title location.address')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalTasks = await MaintenanceTask.countDocuments(filter);
    
    res.json({
      success: true,
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTasks,
        pages: Math.ceil(totalTasks / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get maintenance tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get maintenance task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('property', 'title location.address');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }
    
    // Check access permissions
    if (task.createdBy._id.toString() !== req.user.userId && 
        task.assignedTo?._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get maintenance task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create maintenance task
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['plumbing', 'electrical', 'hvac', 'general', 'appliance', 'exterior', 'interior', 'landscaping']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('property').notEmpty().withMessage('Property ID is required')
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
    
    const taskData = {
      ...req.body,
      createdBy: req.user.userId
    };
    
    const task = new MaintenanceTask(taskData);
    await task.save();
    
    const populatedTask = await MaintenanceTask.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('property', 'title location.address');
    
    res.status(201).json({
      success: true,
      message: 'Maintenance task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update maintenance task
router.put('/:id', [auth], async (req, res) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }
    
    // Check permissions
    if (task.createdBy.toString() !== req.user.userId && 
        task.assignedTo?.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const updatedTask = await MaintenanceTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('property', 'title location.address');
    
    res.json({
      success: true,
      message: 'Maintenance task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update maintenance task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete maintenance task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }
    
    // Check permissions
    if (task.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await MaintenanceTask.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Maintenance task deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get maintenance schedule for a property
router.get('/schedule/:propertyId', auth, async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findOne({
      property: req.params.propertyId
    }).populate('property', 'title location.address');
    
    res.json({
      success: true,
      schedule: schedule || null
    });
  } catch (error) {
    console.error('Get maintenance schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create or update maintenance schedule
router.post('/schedule/:propertyId', [auth], async (req, res) => {
  try {
    let schedule = await MaintenanceSchedule.findOne({
      property: req.params.propertyId
    });
    
    if (schedule) {
      // Update existing schedule
      schedule = await MaintenanceSchedule.findByIdAndUpdate(
        schedule._id,
        { ...req.body, property: req.params.propertyId, owner: req.user.userId },
        { new: true, runValidators: true }
      ).populate('property', 'title location.address');
    } else {
      // Create new schedule
      schedule = new MaintenanceSchedule({
        ...req.body,
        property: req.params.propertyId,
        owner: req.user.userId
      });
      await schedule.save();
      await schedule.populate('property', 'title location.address');
    }
    
    res.json({
      success: true,
      message: 'Maintenance schedule saved successfully',
      schedule
    });
  } catch (error) {
    console.error('Save maintenance schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;