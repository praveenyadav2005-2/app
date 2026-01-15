const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SECURITY: Ensure JWT_SECRET is set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: JWT_SECRET must be set in production!');
    process.exit(1);
  } else {
    console.warn('⚠️ WARNING: Using default JWT secret. Set JWT_SECRET in production!');
  }
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-only-secret-do-not-use-in-prod';

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Authorization denied.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Token invalid.' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

// Middleware to check if user has already completed the game
const checkGameNotCompleted = (req, res, next) => {
  if (req.user.gameCompleted) {
    return res.status(403).json({
      success: false,
      message: 'You have already completed the game and cannot play again.',
      gameCompletedAt: req.user.gameCompletedAt
    });
  }
  next();
};

module.exports = { authenticate, checkGameNotCompleted, JWT_SECRET: EFFECTIVE_JWT_SECRET };

