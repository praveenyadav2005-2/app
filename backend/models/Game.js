const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  // Game state tracking
  isPlaying: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  // Game stats
  health: {
    type: Number,
    default: 3,
    min: 0,
    max: 3
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  portalsCleared: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusesCleared: {
    type: Number,
    default: 0,
    min: 0
  },
  obstaclesHit: {
    type: Number,
    default: 0,
    min: 0
  },
  // Difficulty and speed
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'EASY'
  },
  currentSpeed: {
    type: Number,
    default: 200,
    min: 200
  },
  // Time tracking
  globalTimeLeft: {
    type: Number,
    default: 7200, // 2 hours in seconds
    min: 0
  },
  timeSurvived: {
    type: Number,
    default: 0,
    min: 0
  },
  // Game events log (for tracking important actions)
  events: [{
    action: {
      type: String,
      enum: ['game_start', 'answer_correct', 'answer_incorrect', 'health_loss', 'demogorgon_hit', 'portal_cleared', 'bonus_collected', 'game_over', 'time_over'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      type: mongoose.Schema.Types.Mixed // Flexible data for each event
    }
  }],
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for performance
gameSchema.index({ userId: 1, isCompleted: 1 });
gameSchema.index({ isCompleted: 1, score: -1 });
gameSchema.index({ createdAt: -1 });

// Method to log an event
gameSchema.methods.logEvent = function(action, data = {}) {
  this.events.push({
    action,
    timestamp: new Date(),
    data
  });
  this.lastUpdated = new Date();
};

// Method to update game state with server-side time validation
gameSchema.methods.updateState = function(updates) {
  const allowedUpdates = [
    'health', 'score', 'portalsCleared', 'bonusesCleared', 
    'obstaclesHit', 'difficulty', 'currentSpeed', 
    'globalTimeLeft', 'timeSurvived'
  ];
  
  // SECURITY: Calculate expected time based on server timestamps
  const now = new Date();
  const elapsedSinceStart = (now - this.startedAt) / 1000; // seconds
  const elapsedSinceLastUpdate = (now - this.lastUpdated) / 1000;
  
  // Validate globalTimeLeft against server time
  if (updates.globalTimeLeft !== undefined) {
    const expectedTimeLeft = Math.max(0, 7200 - elapsedSinceStart);
    // Allow 60 second tolerance for network delays and pauses
    const tolerance = 60;
    if (updates.globalTimeLeft > expectedTimeLeft + tolerance) {
      console.warn(`⚠️ TIME MANIPULATION DETECTED: Client time ${updates.globalTimeLeft}s, expected ~${expectedTimeLeft.toFixed(0)}s`);
      // Use server-calculated time instead
      updates.globalTimeLeft = Math.floor(expectedTimeLeft);
    }
  }
  
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      this[field] = updates[field];
    }
  });
  
  // Update playing status based on health and time
  this.isPlaying = this.health > 0 && this.globalTimeLeft > 0;
  this.lastUpdated = now;
};

// Method to complete the game
gameSchema.methods.complete = function() {
  this.isPlaying = false;
  this.isCompleted = true;
  this.completedAt = new Date();
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('Game', gameSchema);
