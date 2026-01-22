import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import API_URL from '../config';
import SecureStorage from '../utils/secureStorage';
import { markQuestionAsUsed } from '../data/mockData';

// Import all game configuration from centralized config file
import {
  PLAYER,
  SPEED,
  TIME,
  DIFFICULTY,
  DIFFICULTY_PROGRESSION,
  SCORING,
  SPAWN,
  // Legacy exports for backward compatibility
  INITIAL_HEALTH,
  MAX_HEALTH,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  SPEED_INCREMENT_INTERVAL,
  PORTAL_SPAWN_INTERVAL,
  GLOBAL_TIME_LIMIT,
} from '../gameConfig';

// Re-export for backward compatibility with other files importing from GameContext
export {
  DIFFICULTY,
  SCORING,
  INITIAL_HEALTH,
  MAX_HEALTH,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  SPEED_INCREMENT_INTERVAL,
  PORTAL_SPAWN_INTERVAL,
  GLOBAL_TIME_LIMIT,
};

const GameContext = createContext(null);

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
  const [questionsVisited, setQuestionsVisited] = useState(savedState?.questionsVisited ?? 0);
  const [bonusesCleared, setBonusesCleared] = useState(savedState?.bonusesCleared ?? 0);
  const [obstaclesHit, setObstaclesHit] = useState(savedState?.obstaclesHit ?? 0);
  const [difficulty, setDifficulty] = useState(savedState?.difficulty || DIFFICULTY.EASY);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(initialAdjustedTime);
  const [timeSurvived, setTimeSurvived] = useState(() => {
    if (!savedState) return 0;
    return (savedState.timeSurvived ?? 0) + cappedElapsedTime;
  });
  const [currentSpeed, setCurrentSpeed] = useState(savedState?.currentSpeed ?? INITIAL_SPEED);
  
  // Question state - restore from saved state if available
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (savedState?.currentQuestion && savedState?.showQuestionOverlay) {
      return savedState.currentQuestion;
    }
    return null;
  });
  const [showQuestionOverlay, setShowQuestionOverlay] = useState(() => {
    if (savedState?.currentQuestion && savedState?.showQuestionOverlay) {
      return true;
    }
    return false;
  });
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(() => {
    // Initialize with adjusted time if there was an active question
    if (savedState?.currentQuestion && savedState?.showQuestionOverlay && savedState?.questionTimeRemaining != null) {
      const lastSaved = savedState.lastSavedTimestamp;
      const elapsedSeconds = lastSaved ? (Date.now() - lastSaved) / 1000 : 0;
      const adjustedTime = Math.max(0, savedState.questionTimeRemaining - elapsedSeconds);
      return adjustedTime;
    }
    return null;
  });
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  // Phaser game reference
  const phaserGameRef = useRef(null);
  
  // Refs for rapidly-changing values (to avoid callback recreation on every tick)
  const globalTimeLeftRef = useRef(globalTimeLeft);
  const timeSurvivedRef = useRef(timeSurvived);
  const scoreRef = useRef(score);
  const lastResultRef = useRef(null);
  
  // Keep refs in sync with state
  useEffect(() => { globalTimeLeftRef.current = globalTimeLeft; }, [globalTimeLeft]);
  useEffect(() => { timeSurvivedRef.current = timeSurvived; }, [timeSurvived]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Function to reset all game state - MUST be defined before useEffect that uses it
  const resetGameState = useCallback(() => {
    setGameStatus('idle');
    setHealth(INITIAL_HEALTH);
    setScore(0);
    setPortalsCleared(0);
    setQuestionsVisited(0);
    setBonusesCleared(0);
    setObstaclesHit(0);
    setDifficulty(DIFFICULTY.EASY);
    setGlobalTimeLeft(GLOBAL_TIME_LIMIT);
    setTimeSurvived(0);
    setCurrentSpeed(INITIAL_SPEED);
    setShowQuestionOverlay(false);
    setShowResultOverlay(false);
    setCurrentQuestion(null);
    setLastResult(null);
    setQuestionTimeRemaining(null); // Reset question timer for new user
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
        questionsVisited,
        bonusesCleared,
        obstaclesHit,
        difficulty,
        globalTimeLeft,
        timeSurvived,
        currentSpeed,
        // Save question state for resume after refresh
        currentQuestion,
        showQuestionOverlay,
        questionTimeRemaining,
        lastSavedTimestamp: Date.now(), // Track when state was last saved
      };
      saveGameState(stateToSave);
    }
  }, [gameStatus, health, score, portalsCleared, questionsVisited, bonusesCleared, obstaclesHit, difficulty, globalTimeLeft, timeSurvived, currentSpeed, currentQuestion, showQuestionOverlay, questionTimeRemaining, saveGameState]);

  // Save state with fresh timestamp when user leaves the page
  useEffect(() => {
    const saveStateOnLeave = () => {
      if (gameStatus === 'playing' || gameStatus === 'paused') {
        const stateToSave = {
          gameStatus,
          health,
          score,
          portalsCleared,
          questionsVisited,
          bonusesCleared,
          obstaclesHit,
          difficulty,
          globalTimeLeft,
          timeSurvived,
          currentSpeed,
          // Save question state for resume after refresh
          currentQuestion,
          showQuestionOverlay,
          questionTimeRemaining,
          lastSavedTimestamp: Date.now(),
        };
        // Use SecureStorage for encrypted data
        if (currentUsername) {
          const key = getGameStateKey(currentUsername);
          SecureStorage.setItem(key, stateToSave, currentUsername);
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
  }, [gameStatus, health, score, portalsCleared, bonusesCleared, obstaclesHit, difficulty, globalTimeLeft, timeSurvived, currentSpeed, currentQuestion, showQuestionOverlay, questionTimeRemaining, currentUsername, getGameStateKey]);

  // Check for username changes on every render
  React.useEffect(() => {
    const currentUsername = localStorage.getItem('username');
    const lastUsername = lastUsernameRef.current;

    if (currentUsername !== lastUsername) {
      lastUsernameRef.current = currentUsername;

      if (currentUsername) {
        // New user logged in
        setUsername(currentUsername);
        setUserId(localStorage.getItem('userId') || '');
        setToken(localStorage.getItem('token') || '');
        setUserEmail(localStorage.getItem('userEmail') || '');
        setPlayerId(currentUsername);

        // CRITICAL: Reset ALL game state for new user
        resetGameState();
      } else {
        // User logged out
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
      }
      
      // If time ran out while away, end the game
      if (adjustedTimeLeft <= 0) {
        setGameStatus('ended');
        setGlobalTimeLeft(0);
        return;
      }
      
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
      
      // Restore question state if there was an active question
      // Note: Question state may already be initialized from savedState during component mount
      if (existingSavedState.currentQuestion && existingSavedState.showQuestionOverlay) {
        // Only set if not already set from initialization
        if (!currentQuestion) {
          setCurrentQuestion(existingSavedState.currentQuestion);
        }
        if (!showQuestionOverlay) {
          setShowQuestionOverlay(true);
        }
        // questionTimeRemaining is already initialized with adjusted time from useState
        setGameStatus('paused'); // Keep game paused while question is active
      } else {
        setGameStatus('playing');
      }
      return;
    }
    
    // Starting a fresh game
    setHealth(INITIAL_HEALTH);
    setScore(0);
    setPortalsCleared(0);
    setQuestionsVisited(0);
    setBonusesCleared(0);
    setObstaclesHit(0);
    setDifficulty(DIFFICULTY.EASY);
    setGlobalTimeLeft(GLOBAL_TIME_LIMIT);
    setTimeSurvived(0);
    setCurrentSpeed(INITIAL_SPEED);
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
        if (!data.success) {
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
      if (!data.success) {
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
      // Use the scene's pauseGame method which properly sets isGameActive = false
      const runnerScene = phaserGameRef.current.scene.scenes[0];
      if (runnerScene.pauseGame) {
        runnerScene.pauseGame();
      } else {
        runnerScene.physics?.pause();
      }
    }
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setGameStatus('playing');
    if (phaserGameRef.current?.scene?.scenes[0]) {
      // Use the scene's resumeGame method which properly sets isGameActive = true
      const runnerScene = phaserGameRef.current.scene.scenes[0];
      if (runnerScene.resumeGame) {
        runnerScene.resumeGame();
      } else {
        runnerScene.physics?.resume();
      }
    }
  }, []);

  // End game
  const endGame = useCallback(() => {
    setGameStatus('ended');
    if (phaserGameRef.current?.scene?.scenes[0]) {
      // Use the scene's stopGame method which properly sets isGameActive = false
      const runnerScene = phaserGameRef.current.scene.scenes[0];
      if (runnerScene.stopGame) {
        runnerScene.stopGame();
      } else {
        runnerScene.physics?.pause();
      }
    }
    
    // Update backend with game over status (use refs for rapidly-changing values)
    const action = health <= 0 ? 'game_over' : 'time_over';
    updateGameStateOnBackend(action, {
      health,
      score: scoreRef.current,
      portalsCleared,
      bonusesCleared,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft: globalTimeLeftRef.current,
      timeSurvived: timeSurvivedRef.current
    });
  }, [health, portalsCleared, bonusesCleared, obstaclesHit, difficulty, currentSpeed, updateGameStateOnBackend]);

  // Update difficulty based on questions visited (solved + saved)
  const updateDifficulty = useCallback((visited) => {
    if (visited >= DIFFICULTY_PROGRESSION.PORTALS_FOR_HARD) {
      setDifficulty(DIFFICULTY.HARD);
    } else if (visited >= DIFFICULTY_PROGRESSION.PORTALS_FOR_MEDIUM) {
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

  // Handle demogorgon collision - reduce score based on config
  const handleDemogorgonHit = useCallback(() => {
    const newScore = Math.max(0, score - SCORING.DEMOGORGON_PENALTY);
    const newObstaclesHit = obstaclesHit + 1;
    
    setScore(newScore);
    setObstaclesHit(newObstaclesHit);
    
    // Update backend (use refs for rapidly-changing values)
    updateGameStateOnBackend('demogorgon_hit', {
      health,
      score: newScore,
      portalsCleared,
      bonusesCleared,
      obstaclesHit: newObstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft: globalTimeLeftRef.current,
      timeSurvived: timeSurvivedRef.current
    });
  }, [score, obstaclesHit, health, portalsCleared, bonusesCleared, difficulty, currentSpeed, updateGameStateOnBackend]);

  // Submit answer - allows retries on wrong answers (no health deduction until timeout or save me)
  const submitAnswer = useCallback((answer, timeRemaining, questionTimeLimit) => {
    const trimmedAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQuestion?.correctAnswer?.toLowerCase();
    const isCorrect = trimmedAnswer === correctAnswer;
    const isFastSolve = timeRemaining > questionTimeLimit * 0.5;
    
    let scoreDelta = 0;
    let newHealth = health;
    let newPortals = portalsCleared;
    let newBonuses = bonusesCleared;
    
    if (isCorrect) {
      // Use difficulty-based scoring from gameConfig
      scoreDelta = difficulty.scoreBonus;
      
      newPortals = portalsCleared + 1;
      setPortalsCleared(newPortals);
      
      // Increment questions visited (for difficulty progression)
      const newQuestionsVisited = questionsVisited + 1;
      setQuestionsVisited(newQuestionsVisited);
      updateDifficulty(newQuestionsVisited);
      
      // Check if game should end (reached max questions: 15)
      const reachedMaxQuestions = newQuestionsVisited >= DIFFICULTY_PROGRESSION.MAX_QUESTIONS;
      
      const newScore = Math.max(0, score + scoreDelta);
      setScore(newScore);
      
      // Update backend with new game state (use refs for rapidly-changing values)
      const action = reachedMaxQuestions ? 'game_over' : 'answer_correct';
      updateGameStateOnBackend(action, {
        health: newHealth,
        score: newScore,
        portalsCleared: newPortals,
        bonusesCleared: newBonuses,
        obstaclesHit,
        difficulty: difficulty.name,
        currentSpeed,
        globalTimeLeft: globalTimeLeftRef.current,
        timeSurvived: timeSurvivedRef.current
      });
      
      const result = {
        correct: true,
        newHealth,
        scoreDelta,
        continueGame: newHealth > 0 && !reachedMaxQuestions,
        gameCompleted: reachedMaxQuestions,
      };
      
      // Mark question as used only after correct answer
      markQuestionAsUsed(currentQuestion?.id);
      
      lastResultRef.current = result;
      setLastResult(result);
      setShowQuestionOverlay(false);
      setQuestionTimeRemaining(null); // Clear saved question timer
      setShowResultOverlay(true);
      
      // End game if reached max questions
      if (reachedMaxQuestions) {
        setGameStatus('ended');
        if (phaserGameRef.current?.scene?.scenes[0]) {
          const runnerScene = phaserGameRef.current.scene.scenes[0];
          if (runnerScene.stopGame) {
            runnerScene.stopGame();
          } else {
            runnerScene.physics?.pause();
          }
        }
      }
      
      return result;
    } else {
      // Wrong answer - allow retry (don't deduct health, don't close overlay)
      return {
        correct: false,
        newHealth: health,
        scoreDelta: 0,
        continueGame: true,
        allowRetry: true, // Flag to indicate user can retry
      };
    }
  }, [currentQuestion, health, questionsVisited, portalsCleared, bonusesCleared, obstaclesHit, score, difficulty, currentSpeed, updateDifficulty, updateGameStateOnBackend]);

  // Use Save Me - skips the question but uses a life
  const useSaveMe = useCallback(() => {
    const newHealth = Math.max(0, health - 1);
    setHealth(newHealth);
    
    // Increment questions visited (for difficulty progression)
    const newQuestionsVisited = questionsVisited + 1;
    setQuestionsVisited(newQuestionsVisited);
    updateDifficulty(newQuestionsVisited);
    
    // Check if game should end (health depleted OR reached max questions: 15)
    const reachedMaxQuestions = newQuestionsVisited >= DIFFICULTY_PROGRESSION.MAX_QUESTIONS;
    const shouldEndGame = newHealth <= 0 || reachedMaxQuestions;
    
    // Update backend with appropriate action (use refs for rapidly-changing values)
    const action = shouldEndGame ? 'game_over' : 'save_me_used';
    updateGameStateOnBackend(action, {
      health: newHealth,
      score: scoreRef.current,
      portalsCleared,
      bonusesCleared,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft: globalTimeLeftRef.current,
      timeSurvived: timeSurvivedRef.current
    });
    
    const result = {
      correct: false,
      newHealth,
      scoreDelta: 0,
      continueGame: !shouldEndGame,
      savedWithLife: true,
      gameCompleted: reachedMaxQuestions,
    };
    
    // Mark question as used when skipped with Save Me
    markQuestionAsUsed(currentQuestion?.id);
    
    lastResultRef.current = result;
    setLastResult(result);
    setShowQuestionOverlay(false);
    setQuestionTimeRemaining(null); // Clear saved question timer
    setShowResultOverlay(true);
    
    // If health is 0 or reached max questions, immediately set game status to ended
    if (shouldEndGame) {
      setGameStatus('ended');
      if (phaserGameRef.current?.scene?.scenes[0]) {
        const runnerScene = phaserGameRef.current.scene.scenes[0];
        if (runnerScene.stopGame) {
          runnerScene.stopGame();
        } else {
          runnerScene.physics?.pause();
        }
      }
    }
    
    return result;
  }, [health, questionsVisited, portalsCleared, bonusesCleared, obstaclesHit, difficulty, currentSpeed, updateGameStateOnBackend, updateDifficulty, currentQuestion]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    const newHealth = Math.max(0, health - 1);
    setHealth(newHealth);
    
    // Increment questions visited (for difficulty progression) - timeout also counts as visiting
    const newQuestionsVisited = questionsVisited + 1;
    setQuestionsVisited(newQuestionsVisited);
    updateDifficulty(newQuestionsVisited);
    
    // Check if game should end (health depleted OR reached max questions: 15)
    const reachedMaxQuestions = newQuestionsVisited >= DIFFICULTY_PROGRESSION.MAX_QUESTIONS;
    const shouldEndGame = newHealth <= 0 || reachedMaxQuestions;
    
    // Update backend for timeout with appropriate action (use refs for rapidly-changing values)
    const action = shouldEndGame ? 'game_over' : 'answer_incorrect';
    updateGameStateOnBackend(action, {
      health: newHealth,
      score: scoreRef.current,
      portalsCleared,
      bonusesCleared,
      obstaclesHit,
      difficulty: difficulty.name,
      currentSpeed,
      globalTimeLeft: globalTimeLeftRef.current,
      timeSurvived: timeSurvivedRef.current
    });
    
    const result = {
      correct: false,
      newHealth,
      scoreDelta: 0,
      continueGame: !shouldEndGame,
      timeout: true,
      gameCompleted: reachedMaxQuestions,
    };
    
    // Mark question as used when time runs out
    markQuestionAsUsed(currentQuestion?.id);
    
    lastResultRef.current = result;
    setLastResult(result);
    setShowQuestionOverlay(false);
    setQuestionTimeRemaining(null); // Clear saved question timer
    setShowResultOverlay(true);
    
    // If health is 0 or reached max questions, immediately set game status to ended
    if (shouldEndGame) {
      setGameStatus('ended');
      if (phaserGameRef.current?.scene?.scenes[0]) {
        const runnerScene = phaserGameRef.current.scene.scenes[0];
        if (runnerScene.stopGame) {
          runnerScene.stopGame();
        } else {
          runnerScene.physics?.pause();
        }
      }
    }
    
    return result;
  }, [health, questionsVisited, portalsCleared, bonusesCleared, obstaclesHit, difficulty, currentSpeed, updateGameStateOnBackend, updateDifficulty, currentQuestion]);

  // Close result overlay
  const closeResultOverlay = useCallback(() => {
    setShowResultOverlay(false);
    setCurrentQuestion(null);
    
    if (lastResultRef.current?.continueGame) {
      resumeGame();
    } else {
      endGame();
    }
  }, [resumeGame, endGame]);

  // Refs for throttling state updates (to avoid re-rendering 60 times per second)
  const timeAccumulator = useRef(0);
  const UPDATE_INTERVAL = 0.1; // Update state every 100ms instead of every frame
  
  // Independent global timer that runs regardless of Phaser pause state
  // This ensures the timer keeps running during question overlays and in the background
  const globalTimerRef = useRef(null);
  const lastTickTimeRef = useRef(null);
  
  // Start/stop the independent global timer based on game status
  useEffect(() => {
    // Timer should run when game is 'playing' OR 'paused' (paused = question overlay active)
    const shouldTimerRun = gameStatus === 'playing' || gameStatus === 'paused';
    
    if (shouldTimerRun && !globalTimerRef.current) {
      // Start the independent timer
      lastTickTimeRef.current = Date.now();
      
      globalTimerRef.current = setInterval(() => {
        const now = Date.now();
        const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;
        
        setGlobalTimeLeft(prev => {
          const newTime = prev - deltaSeconds;
          if (newTime <= 0) {
            // Clear timer and end game
            if (globalTimerRef.current) {
              clearInterval(globalTimerRef.current);
              globalTimerRef.current = null;
            }
            // Trigger end game on next tick to avoid state update during render
            setTimeout(() => endGame(), 0);
            return 0;
          }
          return newTime;
        });
        
        setTimeSurvived(prev => prev + deltaSeconds);
      }, 100); // Update every 100ms
    } else if (!shouldTimerRun && globalTimerRef.current) {
      // Stop the timer when game ends or is idle
      clearInterval(globalTimerRef.current);
      globalTimerRef.current = null;
      lastTickTimeRef.current = null;
    }
    
    // Cleanup on unmount
    return () => {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
    };
  }, [gameStatus, endGame]);

  // Handle visibility change to catch up timer when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastTickTimeRef.current) {
        // Tab became visible - catch up the elapsed time
        const now = Date.now();
        const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;
        
        if (deltaSeconds > 0.2) { // Only catch up if more than 200ms passed
          setGlobalTimeLeft(prev => {
            const newTime = prev - deltaSeconds;
            if (newTime <= 0) {
              setTimeout(() => endGame(), 0);
              return 0;
            }
            return newTime;
          });
          
          setTimeSurvived(prev => prev + deltaSeconds);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [endGame]);

  // Update global timer - now only used for Phaser frame updates (deprecated, kept for compatibility)
  // The independent timer above handles the actual time tracking
  const updateGlobalTime = useCallback((deltaSeconds) => {
    // No-op: Global timer is now handled independently via setInterval
    // This function is kept for backward compatibility with PhaserGame.js
  }, []);

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
    questionTimeRemaining,
    setQuestionTimeRemaining,
    showResultOverlay,
    lastResult,
    
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
    useSaveMe,
    handleTimeout,
    closeResultOverlay,
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
