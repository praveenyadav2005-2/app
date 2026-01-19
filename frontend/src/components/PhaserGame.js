import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import RunnerScene from '../game/RunnerScene';
import UIScene from '../game/UIScene';
import { useGame } from '../context/GameContext';
import { INITIAL_SPEED } from '../gameConfig';
import { getRandomQuestion } from '../data/mockData';

const PhaserGame = React.memo(() => {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const uiSceneRef = useRef(null);
  const callbacksRef = useRef({ onPortalHit: null, onGameTick: null, onDemogorgonHit: null });
  const { 
    phaserGameRef,
    gameStatus,
    difficulty,
    speedMultiplier,
    handlePortalHit,
    handleDemogorgonHit,
    updateGlobalTime,
    currentQuestion,
    setCurrentQuestion,
    setShowQuestionOverlay,
    pauseGame,
    health,
    score,
    portalsCleared,
    globalTimeLeft,
  } = useGame();

  // Handle portal collision - only get new question if there isn't one already
  const onPortalHit = useCallback(() => {
    // Check if there's already an active question (e.g., restored from saved state)
    // If so, don't fetch a new one
    if (currentQuestion) {
      pauseGame();
      setShowQuestionOverlay(true);
      return;
    }
    
    // Get new question based on current difficulty
    const question = getRandomQuestion(difficulty.name);
    setCurrentQuestion(question);
    pauseGame();
    setShowQuestionOverlay(true);
  }, [difficulty.name, currentQuestion, setCurrentQuestion, pauseGame, setShowQuestionOverlay]);

  // Handle game tick for time updates
  const onGameTick = useCallback((deltaSeconds) => {
    updateGlobalTime(deltaSeconds);
  }, [updateGlobalTime]);

  // Keep callbacks in ref to avoid stale closures
  useEffect(() => {
    callbacksRef.current.onPortalHit = onPortalHit;
    callbacksRef.current.onGameTick = onGameTick;
    callbacksRef.current.onDemogorgonHit = handleDemogorgonHit;
  }, [onPortalHit, onGameTick, handleDemogorgonHit]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Phaser game
  useEffect(() => {
    if (!gameContainerRef.current || gameInstanceRef.current) return;

    const containerHeight = gameContainerRef.current.clientHeight || 400;
    
    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: gameContainerRef.current.clientWidth,
      height: containerHeight,
      backgroundColor: '#050505',
      render: {
        pixelArt: true,
        antialias: false,
        powerPreference: 'high-performance',
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 600 },
          debug: false,
        },
      },
      audio: {
        noAudio: true, // Disable audio to prevent AudioContext errors
      },
      scene: [RunnerScene, UIScene],
      scale: {
        mode: Phaser.Scale.RESIZE, // Use RESIZE mode for dynamic window changes
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: '100%',
        height: containerHeight,
      },
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;
    phaserGameRef.current = game;

    // Pass callbacks to scenes using refs to get latest values
    game.events.once('ready', () => {
      const runnerScene = game.scene.scenes[0];
      if (runnerScene) {
        runnerScene.onPortalHit = () => callbacksRef.current.onPortalHit?.();
        runnerScene.onDemogorgonHit = () => callbacksRef.current.onDemogorgonHit?.();
        runnerScene.onGameTick = (delta) => callbacksRef.current.onGameTick?.(delta);
        runnerScene.currentSpeed = INITIAL_SPEED;
      }

      const uiScene = game.scene.scenes[1];
      if (uiScene) {
        uiSceneRef.current = uiScene;
      }
    });

    // Handle resize with debounce
    let resizeTimeout;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (game && gameContainerRef.current) {
          const newWidth = gameContainerRef.current.clientWidth;
          const newHeight = gameContainerRef.current.clientHeight || 400;
          // Trigger Phaser's internal resize which will emit the 'resize' event
          game.scale.resize(newWidth, newHeight);
          game.scale.refresh();
        }
      }, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
        phaserGameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle game status changes
  useEffect(() => {
    if (!gameInstanceRef.current) return;

    const scene = gameInstanceRef.current.scene.scenes[0];
    if (!scene) return;

    if (gameStatus === 'paused') {
      scene.pauseGame();
    } else if (gameStatus === 'playing') {
      scene.resumeGame();
    } else if (gameStatus === 'ended') {
      scene.stopGame();
    }
  }, [gameStatus]);

  // Update speed multiplier
  useEffect(() => {
    if (!gameInstanceRef.current) return;

    const scene = gameInstanceRef.current.scene.scenes[0];
    if (scene) {
      scene.setSpeedMultiplier(speedMultiplier);
    }
  }, [speedMultiplier]);

  // Update UI HUD with game data
  useEffect(() => {
    if (uiSceneRef.current) {
      const difficultyName = difficulty?.name || 'EASY';
      uiSceneRef.current.updateGameData({
        health,
        score,
        portalsCleared,
        timeLeft: formatTime(globalTimeLeft),
        difficulty: difficultyName,
      });
    }
  }, [health, score, portalsCleared, globalTimeLeft, difficulty]);

  return (
    <div 
      data-testid="phaser-game-container"
      ref={gameContainerRef}
      className="w-full h-[300px] sm:h-[400px] bg-black border-2 border-red-900/50 box-glow-red overflow-hidden"
    />
  );
});

export default PhaserGame;
