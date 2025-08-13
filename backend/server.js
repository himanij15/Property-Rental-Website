const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const tourRoutes = require('./routes/tours');
const maintenanceRoutes = require('./routes/maintenance');
const negotiationRoutes = require('./routes/negotiations');
const toolRoutes = require('./routes/tools');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create upload directories if they don't exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/properties', 'uploads/avatars'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwellogo';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/tools', toolRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dwellogo API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Dwellogo API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      properties: '/api/properties',
      tours: '/api/tours',
      maintenance: '/api/maintenance',
      negotiations: '/api/negotiations',
      tools: '/api/tools'
    },
    documentation: '/api/health'
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join virtual tour room
  socket.on('join-tour', (tourId) => {
    socket.join(`tour-${tourId}`);
    socket.to(`tour-${tourId}`).emit('user-joined', {
      socketId: socket.id,
      message: 'A user joined the tour'
    });
    console.log(`User ${socket.id} joined tour ${tourId}`);
  });

  // Leave virtual tour room
  socket.on('leave-tour', (tourId) => {
    socket.leave(`tour-${tourId}`);
    socket.to(`tour-${tourId}`).emit('user-left', {
      socketId: socket.id,
      message: 'A user left the tour'
    });
    console.log(`User ${socket.id} left tour ${tourId}`);
  });

  // Virtual tour navigation
  socket.on('tour-navigate', (data) => {
    socket.to(`tour-${data.tourId}`).emit('tour-navigate', {
      room: data.room,
      position: data.position,
      user: data.user,
      timestamp: new Date()
    });
  });

  // Chat messages
  socket.on('chat-message', (data) => {
    io.to(`tour-${data.tourId}`).emit('chat-message', {
      message: data.message,
      user: data.user,
      timestamp: new Date(),
      socketId: socket.id
    });
  });

  // Negotiation chat
  socket.on('join-negotiation', (negotiationId) => {
    socket.join(`negotiation-${negotiationId}`);
    console.log(`User ${socket.id} joined negotiation ${negotiationId}`);
  });

  socket.on('leave-negotiation', (negotiationId) => {
    socket.leave(`negotiation-${negotiationId}`);
    console.log(`User ${socket.id} left negotiation ${negotiationId}`);
  });

  socket.on('negotiation-message', (data) => {
    io.to(`negotiation-${data.negotiationId}`).emit('negotiation-message', {
      message: data.message,
      user: data.user,
      timestamp: new Date(),
      type: data.type || 'message',
      socketId: socket.id
    });
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `API route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/users', 
      '/api/properties',
      '/api/tours',
      '/api/maintenance',
      '/api/negotiations',
      '/api/tools'
    ]
  });
});

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Dwellogo API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };