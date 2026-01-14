import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import RunnerScene from '../game/RunnerScene';
import UIScene from '../game/UIScene';
import { useGame, INITIAL_SPEED } from '../context/GameContext';
import { getRandomQuestion } from '../data/mockData';

const PhaserGame = () => {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const uiSceneRef = useRef(null);
  const { 
    phaserGameRef,
    gameStatus,
    difficulty,
    speedMultiplier,
    handlePortalHit,
    updateGlobalTime,
    setCurrentQuestion,
    setShowQuestionOverlay,
    pauseGame,
    health,
    score,
    portalsCleared,
    globalTimeLeft,
  } = useGame();

  // Handle portal collision
  const onPortalHit = useCallback(() => {
    // Get question based on current difficulty
    const question = getRandomQuestion(difficulty.name);
    setCurrentQuestion(question);
    pauseGame();
    setShowQuestionOverlay(true);
  }, [difficulty.name, setCurrentQuestion, pauseGame, setShowQuestionOverlay]);

  // Handle game tick for time updates
  const onGameTick = useCallback((deltaSeconds) => {
    updateGlobalTime(deltaSeconds);
  }, [updateGlobalTime]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Phaser game
  useEffect(() => {
    if (!gameContainerRef.current || gameInstanceRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: gameContainerRef.current.clientWidth,
      height: 400,
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
      scene: [RunnerScene, UIScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: true,
        fullscreenTarget: 'game',
      },
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;
    phaserGameRef.current = game;

    // Pass callbacks to scenes
    game.events.once('ready', () => {
      const runnerScene = game.scene.scenes[0];
      if (runnerScene) {
        runnerScene.onPortalHit = onPortalHit;
        runnerScene.onGameTick = onGameTick;
        runnerScene.currentSpeed = INITIAL_SPEED;
      }

      const uiScene = game.scene.scenes[1];
      if (uiScene) {
        uiSceneRef.current = uiScene;
      }
    });

    // Handle resize
    const handleResize = () => {
      if (game && gameContainerRef.current) {
        game.scale.resize(gameContainerRef.current.clientWidth, 400);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
        phaserGameRef.current = null;
      }
    };
  }, [phaserGameRef, onPortalHit, onGameTick]);

  // Update scene callbacks when they change
  useEffect(() => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.scenes[0];
      if (scene) {
        scene.onPortalHit = onPortalHit;
        scene.onGameTick = onGameTick;
      }
    }
  }, [onPortalHit, onGameTick]);

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
      className="w-full h-[400px] bg-black border-2 border-red-900/50 box-glow-red overflow-hidden"
    />
  );
};

export default PhaserGame;
