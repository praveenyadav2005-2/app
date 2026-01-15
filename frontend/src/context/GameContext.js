import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import API_URL from '../config';
import SecureStorage from '../utils/secureStorage';

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
  EASY: { name: 'EASY', timeLimit: 1200, scoreBonus: 100 },
  MEDIUM: { name: 'MEDIUM', timeLimit: 1800, scoreBonus: 100 },
  HARD: { name: 'HARD', timeLimit: 2400, scoreBonus: 100 },
};

// Scoring rules
export const SCORING = {
  CORRECT: 100,
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
  
  // Helper to load game state from encrypted localStorage (user-specific)
  const loadGameState = useCallback(() => {
    if (!currentUsername) return null;
    const key = getGameStateKey(currentUsername);
    // Use SecureStorage for encrypted data
    const saved = SecureStorage.getItem(key, currentUsername);
    if (saved) {
      return saved;
    }
    return null;
  }, [currentUsername, getGameStateKey]);
  
  // Helper to save game state to encrypted localStorage (user-specific)
  const saveGameState = useCallback((state) => {
    if (!currentUsername) return;
    const key = getGameStateKey(currentUsername);
    // Use SecureStorage for encrypted data
    SecureStorage.setItem(key, state, currentUsername);
  }, [currentUsername, getGameStateKey]);
  
  const savedState = loadGameState();
  
  // Calculate adjusted time if returning from a previous session (memoized to run once)
  const adjustedTimeCalculated = useRef(false);
  const cachedAdjustedTime = useRef(null);
  
  const getAdjustedTimeLeft = useCallback(() => {
    // Return cached value if already calculated
    if (adjustedTimeCalculated.current && cachedAdjustedTime.current !== null) {
      return cachedAdjustedTime.current;
    }
    
    if (!savedState) {
      cachedAdjustedTime.current = GLOBAL_TIME_LIMIT;
      adjustedTimeCalculated.current = true;
      return GLOBAL_TIME_LIMIT;
    }
    if (savedState.gameStatus !== 'playing' && savedState.gameStatus !== 'paused') {
      const time = savedState.globalTimeLeft ?? GLOBAL_TIME_LIMIT;
      cachedAdjustedTime.current = time;
      adjustedTimeCalculated.current = true;
      return time;
    }
    
    const lastSaved = savedState.lastSavedTimestamp;
    if (!lastSaved) {
      const time = savedState.globalTimeLeft ?? GLOBAL_TIME_LIMIT;
      cachedAdjustedTime.current = time;
      adjustedTimeCalculated.current = true;
      return time;
    }
    
    const elapsedSeconds = (Date.now() - lastSaved) / 1000;
    const adjustedTime = (savedState.globalTimeLeft ?? GLOBAL_TIME_LIMIT) - elapsedSeconds;
    
    // Only log once on initial calculation
    if (!adjustedTimeCalculated.current) {
      console.log(`⏱️ [GameContext] Time elapsed while away: ${elapsedSeconds.toFixed(1)}s, Remaining: ${adjustedTime.toFixed(1)}s`);
    }
    
    cachedAdjustedTime.current = Math.max(0, adjustedTime);
    adjustedTimeCalculated.current = true;
    return cachedAdjustedTime.current;
  }, [savedState]);
  
  // Check if game should have ended while away
  const gameExpiredWhileAway = savedState?.lastSavedTimestamp && 
    (savedState.gameStatus === 'playing' || savedState.gameStatus === 'paused') &&
    getAdjustedTimeLeft() <= 0;
  
  // Player info
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('username') || '');
  const [playerPassword, setPlayerPassword] = useState('');
  
  // Game state - load from localStorage if available
  // If game expired while away, start with ended status
  const initialAdjustedTime = savedState ? getAdjustedTimeLeft() : GLOBAL_TIME_LIMIT;
  
  // Calculate elapsed time while away (used for score and timeSurvived)
  const elapsedWhileAway = savedState?.lastSavedTimestamp 
    ? Math.max(0, (Date.now() - savedState.lastSavedTimestamp) / 1000)
    : 0;
  // Cap elapsed time at the remaining time (can't earn points after time runs out)
  const cappedElapsedTime = savedState?.globalTimeLeft 
    ? Math.min(elapsedWhileAway, savedState.globalTimeLeft)
    : elapsedWhileAway;
    
  const [gameStatus, setGameStatus] = useState(() => {
    if (gameExpiredWhileAway) return 'ended';
    return savedState?.gameStatus || 'idle';
  });
  const [health, setHealth] = useState(savedState?.health ?? INITIAL_HEALTH);
  // Score is preserved exactly as it was when player left (no bonus while away)
  const [score, setScore] = useState(savedState?.score ?? 0);
  const [portalsCleared, setPortalsCleared] = useState(savedState?.portalsCleared ?? 0);
  const [bonusesCleared, setBonusesCleared] = useState(savedState?.bonusesCleared ?? 0);
  const [obstaclesHit, setObstaclesHit] = useState(savedState?.obstaclesHit ?? 0);
  const [difficulty, setDifficulty] = useState(savedState?.difficulty || DIFFICULTY.EASY);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(initialAdjustedTime);
  const [timeSurvived, setTimeSurvived] = useState(() => {
    if (!savedState) return 0;
    return (savedState.timeSurvived ?? 0) + cappedElapsedTime;
  });
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
      SecureStorage.removeItem(key);
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
        lastSavedTimestamp: Date.now(), // Track when state was last saved
      };
      saveGameState(stateToSave);
    }
  }, [gameStatus, health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, globalTimeLeft, timeSurvived, currentSpeed, speedMultiplier, scoreMultiplier, saveGameState]);

  // Save state with fresh timestamp when user leaves the page
  useEffect(() => {
    const saveStateOnLeave = () => {
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
          lastSavedTimestamp: Date.now(),
        };
        // Use SecureStorage for encrypted data
        if (currentUsername) {
          const key = getGameStateKey(currentUsername);
          SecureStorage.setItem(key, stateToSave, currentUsername);
          console.log('💾 [GameContext] Saved encrypted state on page leave');
        }
      }
    };

    // Handle page close/refresh
    const handleBeforeUnload = () => {
      saveStateOnLeave();
    };

    // Handle tab visibility change (switching tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveStateOnLeave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStatus, health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, globalTimeLeft, timeSurvived, currentSpeed, speedMultiplier, scoreMultiplier, currentUsername, getGameStateKey]);

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

  // Handle game that expired while user was away
  const gameExpiredRef = useRef(false);
  useEffect(() => {
    if (gameExpiredWhileAway && !gameExpiredRef.current) {
      gameExpiredRef.current = true;
      console.log('⏰ [GameContext] Game expired while away - triggering game over');
      // The game already started with 'ended' status, clear saved state
      if (currentUsername) {
        const key = getGameStateKey(currentUsername);
        localStorage.removeItem(key);
      }
    }
  }, [gameExpiredWhileAway, currentUsername, getGameStateKey]);

  // Start a new game (or resume if existing game state)
  const startGame = useCallback(async (id, password, forceNew = false) => {
    setPlayerId(id);
    setPlayerPassword(password);
    
    // Check if we should resume an existing game instead of starting fresh
    const existingSavedState = loadGameState();
    
    if (!forceNew && existingSavedState && 
      (existingSavedState.gameStatus === 'playing' || existingSavedState.gameStatus === 'paused')) {
      
      // Calculate adjusted time based on how long user was away
      const lastSaved = existingSavedState.lastSavedTimestamp;
      let adjustedTimeLeft = existingSavedState.globalTimeLeft ?? GLOBAL_TIME_LIMIT;
      
      if (lastSaved) {
        const elapsedSeconds = (Date.now() - lastSaved) / 1000;
        adjustedTimeLeft = Math.max(0, (existingSavedState.globalTimeLeft ?? GLOBAL_TIME_LIMIT) - elapsedSeconds);
        console.log(`⏱️ [GameContext] Time elapsed while away: ${elapsedSeconds.toFixed(1)}s, Adjusted time: ${adjustedTimeLeft.toFixed(1)}s`);
      }
      
      // If time ran out while away, end the game
      if (adjustedTimeLeft <= 0) {
        console.log('⏰ [GameContext] Game expired while away - ending game');
        setGameStatus('ended');
        setGlobalTimeLeft(0);
        return;
      }
      
      console.log('🔄 [GameContext] Resuming existing game session');
      // Restore all state from saved data with adjusted time
      setHealth(existingSavedState.health ?? INITIAL_HEALTH);
      setScore(existingSavedState.score ?? 0);
      setPortalsCleared(existingSavedState.portalsCleared ?? 0);
      setBonusesCleared(existingSavedState.bonusesCleared ?? 0);
      setObstaclesHit(existingSavedState.obstaclesHit ?? 0);
      setDifficulty(existingSavedState.difficulty || DIFFICULTY.EASY);
      setGlobalTimeLeft(adjustedTimeLeft); // Use adjusted time!
      setTimeSurvived(existingSavedState.timeSurvived ?? 0);
      setCurrentSpeed(existingSavedState.currentSpeed ?? INITIAL_SPEED);
      setSpeedMultiplier(existingSavedState.speedMultiplier ?? 1);
      setScoreMultiplier(existingSavedState.scoreMultiplier ?? 1);
      setGameStatus('playing');
      return;
    }
    
    // Starting a fresh game
    console.log('🎮 [GameContext] Starting new game');
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
    // Clear previous game state from encrypted storage for current user
    if (currentUsername) {
      const key = getGameStateKey(currentUsername);
      SecureStorage.removeItem(key);
    }
    
    // Call backend to start game session
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/api/game/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          console.log('✅ [GameContext] Game session started on backend:', data.game);
        } else {
          console.error('❌ [GameContext] Failed to start game on backend:', data.message);
        }
      }
    } catch (error) {
      console.error('❌ [GameContext] Error starting game on backend:', error);
    }
  }, [currentUsername, getGameStateKey, loadGameState]);

  // Update game state on backend (called after important actions)
  // DEFINED FIRST because other functions depend on it
  const updateGameStateOnBackend = useCallback(async (action, gameData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_URL}/api/game/state`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          health: gameData.health,
          score: gameData.score,
          portalsCleared: gameData.portalsCleared || 0,
          bonusesCleared: gameData.bonusesCleared || 0,
          obstaclesHit: gameData.obstaclesHit || 0,
          difficulty: gameData.difficulty || 'EASY',
          currentSpeed: gameData.currentSpeed || INITIAL_SPEED,
          globalTimeLeft: Math.floor(gameData.globalTimeLeft || 0),
          timeSurvived: Math.floor(gameData.timeSurvived || 0),
          action: action
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ [GameContext] Game state updated on backend (${action})`);
      } else {
        console.error('❌ [GameContext] Failed to update game state:', data.message);
      }
    } catch (error) {
      console.error('❌ [GameContext] Error updating game state:', error);
    }
  }, []);

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
    
    // Update backend with game over status
    const action = health <= 0 ? 'game_over' : 'time_over';
    updateGameStateOnBackend(action, {
      health,
      score,
      portalsCleared,
      bonusesCleared,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft,
      timeSurvived
    });
  }, [health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, currentSpeed, globalTimeLeft, timeSurvived, updateGameStateOnBackend]);

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

  // Handle demogorgon collision - reduce score by 2
  const handleDemogorgonHit = useCallback(() => {
    const newScore = Math.max(0, score - 2);
    const newObstaclesHit = obstaclesHit + 1;
    
    setScore(newScore);
    setObstaclesHit(newObstaclesHit);
    console.log('[GameContext] Demogorgon hit - score reduced by 2');
    
    // Update backend
    updateGameStateOnBackend('demogorgon_hit', {
      health,
      score: newScore,
      portalsCleared,
      bonusesCleared,
      obstaclesHit: newObstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft,
      timeSurvived
    });
  }, [score, obstaclesHit, health, portalsCleared, bonusesCleared, difficulty, currentSpeed, globalTimeLeft, timeSurvived, updateGameStateOnBackend]);

  // Submit answer
  const submitAnswer = useCallback((answer, timeRemaining, questionTimeLimit) => {
    const trimmedAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQuestion?.correctAnswer?.toLowerCase();
    const isCorrect = trimmedAnswer === correctAnswer;
    const isFastSolve = timeRemaining > questionTimeLimit * 0.5;
    
    let scoreDelta = 0;
    let newHealth = health;
    let powerUp = null;
    let newPortals = portalsCleared;
    let newBonuses = bonusesCleared;
    
    if (isCorrect) {
      scoreDelta = SCORING.CORRECT * scoreMultiplier;
      
      newPortals = portalsCleared + 1;
      setPortalsCleared(newPortals);
      updateDifficulty(newPortals);
      
      // Random power-up chance (20%)
      if (Math.random() < 0.2) {
        const powerUps = ['hawkins_stabilizer', 'lab_medkit', 'signal_booster'];
        powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        applyPowerUp(powerUp);
        newBonuses = bonusesCleared + 1;
        setBonusesCleared(newBonuses);
      }
    } else {
      newHealth = Math.max(0, health - 1);
      setHealth(newHealth);
    }
    
    const newScore = Math.max(0, score + scoreDelta);
    setScore(newScore);
    console.log(`[GameContext.submitAnswer] Score update: ${score} + ${scoreDelta} = ${newScore}`);
    
    // Update backend with new game state
    const action = isCorrect ? 'answer_correct' : 'answer_incorrect';
    updateGameStateOnBackend(action, {
      health: newHealth,
      score: newScore,
      portalsCleared: newPortals,
      bonusesCleared: newBonuses,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft,
      timeSurvived
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
  }, [currentQuestion, health, portalsCleared, bonusesCleared, obstaclesHit, score, scoreMultiplier, difficulty, currentSpeed, globalTimeLeft, timeSurvived, updateDifficulty, updateGameStateOnBackend]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    const newHealth = Math.max(0, health - 1);
    setHealth(newHealth);
    
    // Update backend for timeout (treated as incorrect answer with health loss)
    updateGameStateOnBackend('answer_incorrect', {
      health: newHealth,
      score,
      portalsCleared,
      bonusesCleared,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft,
      timeSurvived
    });
    
    const result = {
      correct: false,
      newHealth,
      scoreDelta: 0,
      powerUp: null,
      continueGame: newHealth > 0,
      timeout: true,
    };
    
    setLastResult(result);
    setShowQuestionOverlay(false);
    setShowResultOverlay(true);
    
    return result;
  }, [health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, currentSpeed, globalTimeLeft, timeSurvived, updateGameStateOnBackend]);

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

  // Refs for throttling state updates (to avoid re-rendering 60 times per second)
  const timeAccumulator = useRef(0);
  const UPDATE_INTERVAL = 0.1; // Update state every 100ms instead of every frame

  // Update global timer
  const updateGlobalTime = useCallback((deltaSeconds) => {
    timeAccumulator.current += deltaSeconds;
    
    // Only update state every UPDATE_INTERVAL seconds to reduce re-renders
    if (timeAccumulator.current >= UPDATE_INTERVAL) {
      const accumulatedTime = timeAccumulator.current;
      timeAccumulator.current = 0;
      
      setGlobalTimeLeft(prev => {
        const newTime = prev - accumulatedTime;
        if (newTime <= 0) {
          endGame();
          return 0;
        }
        return newTime;
      });
      setTimeSurvived(prev => prev + accumulatedTime);
      setScore(prev => prev + Math.floor(accumulatedTime * SCORING.DISTANCE_PER_SECOND));
    }
  }, [endGame]);

  // Update speed
  const updateSpeed = useCallback(() => {
    setCurrentSpeed(prev => prev + SPEED_INCREMENT);
  }, []);

  // Check if there's an existing game that can be resumed
  const hasExistingGame = savedState && 
    (savedState.gameStatus === 'playing' || savedState.gameStatus === 'paused') && 
    !gameExpiredWhileAway;

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
    hasExistingGame,
    handlePortalHit,
    handleDemogorgonHit,
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
