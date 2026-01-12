const express = require('express');
const User = require('../models/User');
const { authenticate, checkGameNotCompleted } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/game/complete
// @desc    Mark game as completed for the user with score
// @access  Private
router.post('/complete', authenticate, checkGameNotCompleted, async (req, res) => {
  try {
    const { score, portalsCleared, timeSurvived } = req.body;

    console.log('🎮 Game Complete Request:');
    console.log('  User ID:', req.user._id);
    console.log('  Username:', req.user.username);
    console.log('  Score:', score);
    console.log('  Portals Cleared:', portalsCleared);
    console.log('  Time Survived:', timeSurvived);

    // Validate score data
    if (typeof score !== 'number' || score < 0) {
      console.error('❌ Invalid score data:', score);
      return res.status(400).json({
        success: false,
        message: 'Invalid score data'
      });
    }

    // Mark game as completed and save score
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        gameCompleted: true,
        gameCompletedAt: new Date(),
        finalScore: score,
        portalsCleared: portalsCleared || 0,
        timeSurvived: timeSurvived || 0
      },
      { new: true }
    ).select('-password');

    console.log('✅ User updated successfully:', {
      username: user.username,
      gameCompleted: user.gameCompleted,
      finalScore: user.finalScore
    });

    res.json({
      success: true,
      message: 'Game completed successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameCompleted: user.gameCompleted,
        gameCompletedAt: user.gameCompletedAt,
        finalScore: user.finalScore,
        portalsCleared: user.portalsCleared,
        timeSurvived: user.timeSurvived
      }
    });
  } catch (error) {
    console.error('❌ Game completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during game completion',
      error: error.message
    });
  }
});

// @route   GET /api/game/leaderboard
// @desc    Get leaderboard with top players sorted by score, then portals, then time
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    console.log('📊 Fetching leaderboard...');
    
    // Fetch all completed games and sort by: score (desc), portals (desc), then time (desc)
    const leaderboard = await User.find({ gameCompleted: true })
      .select('username finalScore portalsCleared timeSurvived gameCompletedAt')
      .sort({ finalScore: -1, portalsCleared: -1, timeSurvived: -1 })
      .limit(100);

    console.log(`✅ Found ${leaderboard.length} completed games`);
    
    if (leaderboard.length > 0) {
      console.log('Top players:', leaderboard.slice(0, 3).map(u => ({
        username: u.username,
        score: u.finalScore,
        portals: u.portalsCleared,
        time: u.timeSurvived
      })));
    }

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      score: user.finalScore,
      portalsCleared: user.portalsCleared,
      timeSurvived: user.timeSurvived,
      completedAt: user.gameCompletedAt
    }));

    res.json({
      success: true,
      leaderboard: leaderboardWithRank,
      totalPlayers: leaderboardWithRank.length
    });
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/game/status
// @desc    Check if user can play the game
// @access  Private
router.get('/status', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      canPlay: !req.user.gameCompleted,
      gameCompleted: req.user.gameCompleted,
      gameCompletedAt: req.user.gameCompletedAt,
      message: req.user.gameCompleted 
        ? 'You have already completed the game' 
        : 'You can play the game'
    });
  } catch (error) {
    console.error('Game status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/game/check-access
// @desc    Check if user has access to play (used as middleware check)
// @access  Private
router.get('/check-access', authenticate, checkGameNotCompleted, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted. You can play the game.',
    canPlay: true
  });
});

module.exports = router;

