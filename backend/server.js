const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Adds security headers (XSS protection, content-type sniffing, etc.)

// CORS configuration - restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limit to prevent DOS
app.use(express.json({ limit: '10kb' }));

// Rate limiting for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // 10 registrations per hour (increased for testing)
  message: { success: false, message: 'Too many registrations, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 60,                   // 60 requests per window (increased)
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Database connection with connection pooling for scalability
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enigma-game';
// Note: Never log MONGODB_URI in production as it may contain credentials

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,        // Handle up to 1000 concurrent users
  minPoolSize: 10,        // Maintain minimum connections
  maxIdleTimeMS: 45000,   // Close idle connections after 45s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/game', apiLimiter);
app.use('/api/game', gameRoutes);

// Health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({ 
      status: dbConnected ? 'healthy' : 'degraded',
      message: 'Server is running',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

