const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Game = require('../models/Game');
const { authenticate, checkGameNotCompleted } = require('../middleware/auth');

const router = express.Router();

// Utility to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/game/start
// @desc    Start a new game session
// @access  Private
router.post('/start', authenticate, checkGameNotCompleted, async (req, res) => {
  try {
    console.log('🎮 Game Start Request:');
    console.log('  User ID:', req.user._id);
    console.log('  Username:', req.user.username);

    // Check if user already has an active game
    let activeGame = await Game.findOne({
      userId: req.user._id,
      isPlaying: true,
      isCompleted: false
    });

    if (activeGame) {
      console.log('⚠️ User already has an active game, returning existing game');
      return res.json({
        success: true,
        message: 'Game session already active',
        game: {
          id: activeGame._id,
          health: activeGame.health,
          score: activeGame.score,
          portalsCleared: activeGame.portalsCleared,
          bonusesCleared: activeGame.bonusesCleared,
          obstaclesHit: activeGame.obstaclesHit,
          difficulty: activeGame.difficulty,
          currentSpeed: activeGame.currentSpeed,
          globalTimeLeft: activeGame.globalTimeLeft,
          timeSurvived: activeGame.timeSurvived,
          isPlaying: activeGame.isPlaying,
          startedAt: activeGame.startedAt
        }
      });
    }

    // Create new game session
    const game = new Game({
      userId: req.user._id,
      username: req.user.username,
      isPlaying: true,
      health: 3,
      score: 0,
      portalsCleared: 0,
      bonusesCleared: 0,
      obstaclesHit: 0,
      difficulty: 'EASY',
      currentSpeed: 200,
      globalTimeLeft: 7200,
      timeSurvived: 0
    });

    // Log game start event
    game.logEvent('game_start', {
      initialHealth: 3,
      initialTime: 7200
    });

    await game.save();

    console.log('✅ New game session started successfully');

    res.json({
      success: true,
      message: 'Game session started',
      game: {
        id: game._id,
        health: game.health,
        score: game.score,
        portalsCleared: game.portalsCleared,
        bonusesCleared: game.bonusesCleared,
        obstaclesHit: game.obstaclesHit,
        difficulty: game.difficulty,
        currentSpeed: game.currentSpeed,
        globalTimeLeft: game.globalTimeLeft,
        timeSurvived: game.timeSurvived,
        isPlaying: game.isPlaying,
        startedAt: game.startedAt
      }
    });
  } catch (error) {
    console.error('❌ Game start error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting game',
      error: error.message
    });
  }
});

// @route   PUT /api/game/state
// @desc    Update game state after important actions (answer submission, health loss, etc.)
// @access  Private
router.put('/state', authenticate, checkGameNotCompleted, async (req, res) => {
  try {
    const { 
      health, 
      score, 
      portalsCleared, 
      bonusesCleared, 
      obstaclesHit,
      difficulty,
      currentSpeed,
      globalTimeLeft,
      timeSurvived,
      action // Type of action: 'answer_correct', 'answer_incorrect', 'health_loss', 'demogorgon_hit', 'portal_cleared', 'bonus_collected'
    } = req.body;

    // Validate required fields and types
    if (typeof health !== 'number' || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid game state data: health and score are required'
      });
    }

    // SECURITY: Validate value ranges to prevent cheating
    const sanitizedHealth = Math.max(0, Math.min(3, Math.floor(health)));
    const sanitizedScore = Math.max(0, Math.floor(score));
    const sanitizedPortals = Math.max(0, Math.floor(portalsCleared || 0));
    const sanitizedBonuses = Math.max(0, Math.floor(bonusesCleared || 0));
    const sanitizedObstacles = Math.max(0, Math.floor(obstaclesHit || 0));
    const sanitizedSpeed = Math.max(200, Math.min(1000, Math.floor(currentSpeed || 200)));
    const sanitizedTimeLeft = Math.max(0, Math.min(7200, Math.floor(globalTimeLeft || 0)));
    const sanitizedTimeSurvived = Math.max(0, Math.floor(timeSurvived || 0));
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    const sanitizedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'EASY';
    const validActions = ['answer_correct', 'answer_incorrect', 'health_loss', 'demogorgon_hit', 'portal_cleared', 'bonus_collected', 'game_over', 'time_over'];
    const sanitizedAction = validActions.includes(action) ? action : null;

    // Find active game
    const game = await Game.findOne({
      userId: req.user._id,
      isPlaying: true,
      isCompleted: false
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'No active game found. Please start a new game.'
      });
    }

    // SECURITY: Validate score increase is reasonable
    // Max score increase per update: 500 (generous for correct answers + distance)
    const MAX_SCORE_INCREASE = 500;
    const scoreIncrease = sanitizedScore - game.score;
    if (scoreIncrease > MAX_SCORE_INCREASE) {
      console.warn(`⚠️ SUSPICIOUS: Large score increase detected for user ${req.user.username}: +${scoreIncrease}`);
      // Allow but log for review - could be legitimate if player was away
    }

    // SECURITY: Health can only decrease (no healing exploits)
    if (sanitizedHealth > game.health && sanitizedAction !== 'bonus_collected') {
      console.warn(`⚠️ SUSPICIOUS: Health increase without bonus for user ${req.user.username}`);
      // Use current health instead
    }

    // Update game state with sanitized values
    game.updateState({
      health: sanitizedHealth,
      score: sanitizedScore,
      portalsCleared: sanitizedPortals,
      bonusesCleared: sanitizedBonuses,
      obstaclesHit: sanitizedObstacles,
      difficulty: sanitizedDifficulty,
      currentSpeed: sanitizedSpeed,
      globalTimeLeft: sanitizedTimeLeft,
      timeSurvived: sanitizedTimeSurvived
    });

    // Log the action event if provided and valid
    if (sanitizedAction) {
      const eventData = {
        health: sanitizedHealth,
        score: sanitizedScore,
        portalsCleared: sanitizedPortals,
        globalTimeLeft: sanitizedTimeLeft,
        timeSurvived: sanitizedTimeSurvived
      };
      game.logEvent(sanitizedAction, eventData);
    }

    // Check if game should end
    if (sanitizedHealth <= 0) {
      game.logEvent('game_over', { reason: 'health_depleted', finalScore: sanitizedScore });
      game.complete();
      console.log('💀 Game over: Health depleted');
    } else if (sanitizedTimeLeft <= 0) {
      game.logEvent('time_over', { reason: 'time_expired', finalScore: sanitizedScore });
      game.complete();
      console.log('⏰ Game over: Time expired');
    }

    await game.save();

    console.log('✅ Game state updated successfully');

    res.json({
      success: true,
      message: 'Game state updated',
      game: {
        id: game._id,
        health: game.health,
        score: game.score,
        portalsCleared: game.portalsCleared,
        bonusesCleared: game.bonusesCleared,
        obstaclesHit: game.obstaclesHit,
        difficulty: game.difficulty,
        currentSpeed: game.currentSpeed,
        globalTimeLeft: game.globalTimeLeft,
        timeSurvived: game.timeSurvived,
        isPlaying: game.isPlaying,
        isCompleted: game.isCompleted
      }
    });
  } catch (error) {
    console.error('❌ Game state update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating game state',
      error: error.message
    });
  }
});

// @route   GET /api/game/state
// @desc    Get current game state
// @access  Private
router.get('/state', authenticate, async (req, res) => {
  try {
    console.log('📊 Get Game State Request:');
    console.log('  User ID:', req.user._id);
    console.log('  Username:', req.user.username);

    // Find active game
    const game = await Game.findOne({
      userId: req.user._id,
      isPlaying: true,
      isCompleted: false
    }).sort({ createdAt: -1 });

    if (!game) {
      return res.json({
        success: true,
        message: 'No active game found',
        game: null
      });
    }

    res.json({
      success: true,
      game: {
        id: game._id,
        health: game.health,
        score: game.score,
        portalsCleared: game.portalsCleared,
        bonusesCleared: game.bonusesCleared,
        obstaclesHit: game.obstaclesHit,
        difficulty: game.difficulty,
        currentSpeed: game.currentSpeed,
        globalTimeLeft: game.globalTimeLeft,
        timeSurvived: game.timeSurvived,
        isPlaying: game.isPlaying,
        isCompleted: game.isCompleted,
        startedAt: game.startedAt,
        lastUpdated: game.lastUpdated
      }
    });
  } catch (error) {
    console.error('❌ Get game state error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game state',
      error: error.message
    });
  }
});

// @route   POST /api/game/complete
// @desc    Mark game as completed for the user with final score
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

    // Find active game
    const game = await Game.findOne({
      userId: req.user._id,
      isPlaying: true,
      isCompleted: false
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'No active game found'
      });
    }

    // Update game with final values and mark as completed
    game.score = score;
    game.portalsCleared = portalsCleared || game.portalsCleared;
    game.timeSurvived = timeSurvived || game.timeSurvived;
    game.complete();

    await game.save();

    // Update user's completion status and best scores
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        gameCompleted: true,
        gameCompletedAt: new Date(),
        finalScore: score,
        portalsCleared: portalsCleared || 0,
        timeSurvived: timeSurvived || 0,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    console.log('✅ Game completed successfully:', {
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
      },
      game: {
        id: game._id,
        completedAt: game.completedAt
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

// @route   GET /api/game/history
// @desc    Get user's game history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-events'); // Exclude detailed events for performance

    res.json({
      success: true,
      games: games.map(game => ({
        id: game._id,
        score: game.score,
        portalsCleared: game.portalsCleared,
        timeSurvived: game.timeSurvived,
        health: game.health,
        isCompleted: game.isCompleted,
        startedAt: game.startedAt,
        completedAt: game.completedAt
      })),
      totalGames: games.length
    });
  } catch (error) {
    console.error('❌ Game history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game history',
      error: error.message
    });
  }
});

// @route   GET /api/game/:gameId
// @desc    Get detailed game information including events
// @access  Private
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    // Validate gameId to prevent NoSQL injection
    if (!isValidObjectId(req.params.gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format'
      });
    }

    const game = await Game.findOne({
      _id: req.params.gameId,
      userId: req.user._id
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      game: {
        id: game._id,
        username: game.username,
        health: game.health,
        score: game.score,
        portalsCleared: game.portalsCleared,
        bonusesCleared: game.bonusesCleared,
        obstaclesHit: game.obstaclesHit,
        difficulty: game.difficulty,
        currentSpeed: game.currentSpeed,
        globalTimeLeft: game.globalTimeLeft,
        timeSurvived: game.timeSurvived,
        isPlaying: game.isPlaying,
        isCompleted: game.isCompleted,
        startedAt: game.startedAt,
        completedAt: game.completedAt,
        lastUpdated: game.lastUpdated,
        events: game.events
      }
    });
  } catch (error) {
    console.error('❌ Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game details',
      error: error.message
    });
  }
});

module.exports = router;

