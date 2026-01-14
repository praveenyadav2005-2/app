import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const GameContext = createContext(null);

// Game constants
export const INITIAL_HEALTH = 3;
export const MAX_HEALTH = 3;
export const INITIAL_SPEED = 200;
export const SPEED_INCREMENT = 20;
export const SPEED_INCREMENT_INTERVAL = 30000; // 30 seconds
export const PORTAL_SPAWN_INTERVAL = 8000; // 8 seconds
export const GLOBAL_TIME_LIMIT = 2 * 60 * 60; // 2 hours in seconds

// Difficulty settings
export const DIFFICULTY = {
  EASY: { name: 'EASY', timeLimit: 10, scoreBonus: 100 },
  MEDIUM: { name: 'MEDIUM', timeLimit: 20, scoreBonus: 100 },
  HARD: { name: 'HARD', timeLimit: 30, scoreBonus: 100 },
};

// Scoring rules
export const SCORING = {
  CORRECT: 100,
  FAST_SOLVE_BONUS: 50,
  WRONG: -50,
  TIMEOUT: -75,
  DISTANCE_PER_SECOND: 1,
};

export const GameProvider = ({ children }) => {
  // Track last known username to detect changes
  const lastUsernameRef = useRef(localStorage.getItem('username') || '');
  const currentUsername = localStorage.getItem('username') || '';
  
  // Helper to get user-specific game state key
  const getGameStateKey = useCallback((username) => {
    return `gameState_${username}`;
  }, []);
  
  // Helper to load game state from localStorage (user-specific)
  const loadGameState = useCallback(() => {
    if (!currentUsername) return null;
    const key = getGameStateKey(currentUsername);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load game state:', e);
        return null;
      }
    }
    return null;
  }, [currentUsername, getGameStateKey]);
  
  // Helper to save game state to localStorage (user-specific)
  const saveGameState = useCallback((state) => {
    if (!currentUsername) return;
    const key = getGameStateKey(currentUsername);
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }, [currentUsername, getGameStateKey]);
  
  const savedState = loadGameState();
  
  // Player info
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('username') || '');
  const [playerPassword, setPlayerPassword] = useState('');
  
  // Game state - load from localStorage if available
  const [gameStatus, setGameStatus] = useState(savedState?.gameStatus || 'idle');
  const [health, setHealth] = useState(savedState?.health ?? INITIAL_HEALTH);
  const [score, setScore] = useState(savedState?.score ?? 0);
  const [portalsCleared, setPortalsCleared] = useState(savedState?.portalsCleared ?? 0);
  const [bonusesCleared, setBonusesCleared] = useState(savedState?.bonusesCleared ?? 0);
  const [obstaclesHit, setObstaclesHit] = useState(savedState?.obstaclesHit ?? 0);
  const [difficulty, setDifficulty] = useState(savedState?.difficulty || DIFFICULTY.EASY);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(savedState?.globalTimeLeft ?? GLOBAL_TIME_LIMIT);
  const [timeSurvived, setTimeSurvived] = useState(savedState?.timeSurvived ?? 0);
  const [currentSpeed, setCurrentSpeed] = useState(savedState?.currentSpeed ?? INITIAL_SPEED);
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionOverlay, setShowQuestionOverlay] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  // Power-ups
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  
  // Phaser game reference
  const phaserGameRef = useRef(null);

  // Function to reset all game state - MUST be defined before useEffect that uses it
  const resetGameState = useCallback(() => {
    console.log('🔄 [GameContext] Resetting all game state');
    setGameStatus('idle');
    setHealth(INITIAL_HEALTH);
    setScore(0);
    setPortalsCleared(0);
    setBonusesCleared(0);
    setObstaclesHit(0);
    setDifficulty(DIFFICULTY.EASY);
    setGlobalTimeLeft(GLOBAL_TIME_LIMIT);
    setTimeSurvived(0);
    setCurrentSpeed(INITIAL_SPEED);
    setActivePowerUps([]);
    setSpeedMultiplier(1);
    setScoreMultiplier(1);
    setShowQuestionOverlay(false);
    setShowResultOverlay(false);
    setCurrentQuestion(null);
    setLastResult(null);
    // Clear saved game state for current user
    if (currentUsername) {
      const key = getGameStateKey(currentUsername);
      localStorage.removeItem(key);
    }
  }, [currentUsername, getGameStateKey]);

  // Auto-save game state whenever it changes
  React.useEffect(() => {
    if (gameStatus === 'playing' || gameStatus === 'paused') {
      const stateToSave = {
        gameStatus,
        health,
        score,
        portalsCleared,
        bonusesCleared,
        obstaclesHit,
        difficulty,
        globalTimeLeft,
        timeSurvived,
        currentSpeed,
        speedMultiplier,
        scoreMultiplier,
      };
      saveGameState(stateToSave);
    }
  }, [gameStatus, health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, globalTimeLeft, timeSurvived, currentSpeed, speedMultiplier, scoreMultiplier, saveGameState]);

  // Check for username changes on every render
  React.useEffect(() => {
    const currentUsername = localStorage.getItem('username');
    const lastUsername = lastUsernameRef.current;

    if (currentUsername !== lastUsername) {
      console.log(`🔄 [GameContext] Username changed: "${lastUsername}" → "${currentUsername}"`);
      lastUsernameRef.current = currentUsername;

      if (currentUsername) {
        // New user logged in
        console.log('✅ [GameContext] Syncing to new user:', currentUsername);
        setUsername(currentUsername);
        setUserId(localStorage.getItem('userId') || '');
        setToken(localStorage.getItem('token') || '');
        setUserEmail(localStorage.getItem('userEmail') || '');
        setPlayerId(currentUsername);

        // CRITICAL: Reset ALL game state for new user
        resetGameState();
      } else {
        // User logged out
        console.log('🚪 [GameContext] User logged out');
        setUsername('');
        setUserId('');
        setToken('');
        setUserEmail('');
        setPlayerId('');
        resetGameState();
      }
    }
  }, [resetGameState]);

  // Listen for explicit reset events
  React.useEffect(() => {
    const handleResetEvent = () => {
      console.log('🎯 [GameContext] Reset event received');
      resetGameState();
    };

    window.addEventListener('gameContextSync', handleResetEvent);
    return () => window.removeEventListener('gameContextSync', handleResetEvent);
  }, [resetGameState]);

  // Start a new game
  const startGame = useCallback((id, password) => {
    setPlayerId(id);
    setPlayerPassword(password);
    setHealth(INITIAL_HEALTH);
    setScore(0);
    setPortalsCleared(0);
    setBonusesCleared(0);
    setObstaclesHit(0);
    setDifficulty(DIFFICULTY.EASY);
    setGlobalTimeLeft(GLOBAL_TIME_LIMIT);
    setTimeSurvived(0);
    setCurrentSpeed(INITIAL_SPEED);
    setActivePowerUps([]);
    setSpeedMultiplier(1);
    setScoreMultiplier(1);
    setGameStatus('playing');
    // Clear previous game state from localStorage for current user
    if (currentUsername) {
      const key = getGameStateKey(currentUsername);
      localStorage.removeItem(key);
    }
  }, [currentUsername, getGameStateKey]);

  // Pause game (for question overlay)
  const pauseGame = useCallback(() => {
    setGameStatus('paused');
    if (phaserGameRef.current?.scene?.scenes[0]) {
      phaserGameRef.current.scene.scenes[0].physics?.pause();
    }
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setGameStatus('playing');
    if (phaserGameRef.current?.scene?.scenes[0]) {
      phaserGameRef.current.scene.scenes[0].physics?.resume();
    }
  }, []);

  // End game
  const endGame = useCallback(() => {
    setGameStatus('ended');
    if (phaserGameRef.current?.scene?.scenes[0]) {
      phaserGameRef.current.scene.scenes[0].physics?.pause();
    }
  }, []);

  // Update difficulty based on portals cleared
  const updateDifficulty = useCallback((portals) => {
    if (portals >= 7) {
      setDifficulty(DIFFICULTY.HARD);
    } else if (portals >= 4) {
      setDifficulty(DIFFICULTY.MEDIUM);
    } else {
      setDifficulty(DIFFICULTY.EASY);
    }
  }, []);

  // Handle portal collision
  const handlePortalHit = useCallback((question) => {
    pauseGame();
    setCurrentQuestion(question);
    setShowQuestionOverlay(true);
  }, [pauseGame]);

  // Submit answer
  const submitAnswer = useCallback((answer, timeRemaining, questionTimeLimit) => {
    const trimmedAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQuestion?.correctAnswer?.toLowerCase();
    const isCorrect = trimmedAnswer === correctAnswer;
    const isFastSolve = timeRemaining > questionTimeLimit * 0.5;
    
    let scoreDelta = 0;
    let newHealth = health;
    let powerUp = null;
    
    if (isCorrect) {
      scoreDelta = SCORING.CORRECT * scoreMultiplier;
      if (isFastSolve) {
        scoreDelta += SCORING.FAST_SOLVE_BONUS;
      }
      
      const newPortals = portalsCleared + 1;
      setPortalsCleared(newPortals);
      updateDifficulty(newPortals);
      
      // Random power-up chance (20%)
      if (Math.random() < 0.2) {
        const powerUps = ['hawkins_stabilizer', 'lab_medkit', 'signal_booster'];
        powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        applyPowerUp(powerUp);
      }
    } else {
      scoreDelta = SCORING.WRONG;
      newHealth = Math.max(0, health - 1);
      setHealth(newHealth);
    }
    
    setScore(prev => {
      const newScore = Math.max(0, prev + scoreDelta);
      console.log(`[GameContext.submitAnswer] Score update: ${prev} + ${scoreDelta} = ${newScore}`);
      return newScore;
    });
    
    const result = {
      correct: isCorrect,
      newHealth,
      scoreDelta,
      powerUp,
      continueGame: newHealth > 0,
    };
    
    setLastResult(result);
    setShowQuestionOverlay(false);
    setShowResultOverlay(true);
    
    return result;
  }, [currentQuestion, health, portalsCleared, scoreMultiplier, updateDifficulty]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    const newHealth = Math.max(0, health - 1);
    setHealth(newHealth);
    setScore(prev => Math.max(0, prev + SCORING.TIMEOUT));
    
    const result = {
      correct: false,
      newHealth,
      scoreDelta: SCORING.TIMEOUT,
      powerUp: null,
      continueGame: newHealth > 0,
      timeout: true,
    };
    
    setLastResult(result);
    setShowQuestionOverlay(false);
    setShowResultOverlay(true);
    
    return result;
  }, [health]);

  // Close result overlay
  const closeResultOverlay = useCallback(() => {
    setShowResultOverlay(false);
    setCurrentQuestion(null);
    
    if (lastResult?.continueGame) {
      resumeGame();
    } else {
      endGame();
    }
  }, [lastResult, resumeGame, endGame]);

  // Apply power-up
  const applyPowerUp = useCallback((type) => {
    switch (type) {
      case 'hawkins_stabilizer':
        setSpeedMultiplier(0.5);
        setActivePowerUps(prev => [...prev, { type, expiresAt: Date.now() + 10000 }]);
        setTimeout(() => {
          setSpeedMultiplier(1);
          setActivePowerUps(prev => prev.filter(p => p.type !== type));
        }, 10000);
        break;
      case 'lab_medkit':
        setHealth(prev => Math.min(MAX_HEALTH, prev + 1));
        break;
      case 'signal_booster':
        setScoreMultiplier(2);
        setActivePowerUps(prev => [...prev, { type, expiresAt: Date.now() + 20000 }]);
        setTimeout(() => {
          setScoreMultiplier(1);
          setActivePowerUps(prev => prev.filter(p => p.type !== type));
        }, 20000);
        break;
      default:
        break;
    }
  }, []);

  // Update global timer
  const updateGlobalTime = useCallback((deltaSeconds) => {
    setGlobalTimeLeft(prev => {
      const newTime = prev - deltaSeconds;
      if (newTime <= 0) {
        endGame();
        return 0;
      }
      return newTime;
    });
    setTimeSurvived(prev => prev + deltaSeconds);
    setScore(prev => prev + Math.floor(deltaSeconds * SCORING.DISTANCE_PER_SECOND));
  }, [endGame]);

  // Update speed
  const updateSpeed = useCallback(() => {
    setCurrentSpeed(prev => prev + SPEED_INCREMENT);
  }, []);

  const value = {
    // Player info
    userId,
    username,
    userEmail,
    token,
    playerId,
    playerPassword,
    
    // Game state
    gameStatus,
    health,
    setHealth,
    score,
    setScore,
    portalsCleared,
    bonusesCleared,
    setBonusesCleared,
    obstaclesHit,
    setObstaclesHit,
    difficulty,
    globalTimeLeft,
    timeSurvived,
    currentSpeed,
    
    // Question state
    currentQuestion,
    showQuestionOverlay,
    showResultOverlay,
    lastResult,
    
    // Power-ups
    activePowerUps,
    speedMultiplier,
    scoreMultiplier,
    
    // Phaser ref
    phaserGameRef,
    
    // Actions
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    handlePortalHit,
    submitAnswer,
    handleTimeout,
    closeResultOverlay,
    applyPowerUp,
    updateGlobalTime,
    updateSpeed,
    setCurrentQuestion,
    setShowQuestionOverlay,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
