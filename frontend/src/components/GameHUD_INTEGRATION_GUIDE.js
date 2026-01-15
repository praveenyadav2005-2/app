/**
 * GameHUD Integration Guide
 * 
 * This file demonstrates how to integrate the GameHUD component
 * with your Phaser game and React context.
 */

// ============================================
// EXAMPLE 1: Using GameHUD in PhaserGame.js
// ============================================

/*
import React, { useState, useEffect } from 'react';
import Phaser from 'phaser';
import GameHUD from './GameHUD';
import RunnerScene from '../game/RunnerScene';
import UIScene from '../game/UIScene';

const PhaserGame = () => {
  const [gameState, setGameState] = useState({
    health: 3,
    score: 0,
    portalsCleared: 0,
    maxPortals: 5,
    difficulty: 'HARD',
    timeLeft: 300,
    maxTime: 300,
  });

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
      scene: [RunnerScene, UIScene],
      parent: 'phaser-container',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      render: {
        pixelArt: false,
        antialias: true,
      },
    };

    const game = new Phaser.Game(config);

    // Listen to game events and update HUD state
    game.events.on('health-changed', (newHealth) => {
      setGameState(prev => ({ ...prev, health: newHealth }));
    });

    game.events.on('score-changed', (newScore) => {
      setGameState(prev => ({ ...prev, score: newScore }));
    });

    game.events.on('portal-cleared', () => {
      setGameState(prev => ({
        ...prev,
        portalsCleared: prev.portalsCleared + 1,
      }));
    });

    game.events.on('time-updated', (remaining) => {
      setGameState(prev => ({ ...prev, timeLeft: remaining }));
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div>
      <div id="phaser-container"></div>
      <GameHUD
        health={gameState.health}
        maxHealth={3}
        score={gameState.score}
        portalsCleared={gameState.portalsCleared}
        maxPortals={gameState.maxPortals}
        difficulty={gameState.difficulty}
        timeLeft={gameState.timeLeft}
        maxTime={gameState.maxTime}
      />
    </div>
  );
};

export default PhaserGame;
*/

// ============================================
// EXAMPLE 2: Using GameHUD with GameContext
// ============================================

/*
import React from 'react';
import GameHUD from './GameHUD';
import { useGame } from '../context/GameContext';

const GameScreen = () => {
  const {
    health,
    score,
    portalsCleared,
    maxPortals,
    difficulty,
    globalTimeLeft,
    maxTime,
  } = useGame();

  return (
    <div className="game-screen">
      <div id="phaser-container"></div>
      <GameHUD
        health={health}
        maxHealth={3}
        score={score}
        portalsCleared={portalsCleared}
        maxPortals={maxPortals}
        difficulty={difficulty.name || 'NORMAL'}
        timeLeft={globalTimeLeft}
        maxTime={maxTime}
      />
    </div>
  );
};

export default GameScreen;
*/

// ============================================
// EXAMPLE 3: Emitting Game State Updates
// ============================================

/*
// In your Phaser Scene (e.g., RunnerScene.js):

class RunnerScene extends Phaser.Scene {
  constructor() {
    super('RunnerScene');
    this.health = 3;
    this.score = 0;
    this.timeLeft = 300;
  }

  create() {
    // ... scene setup ...
  }

  update() {
    // Update time every frame
    this.timeLeft -= this.time.deltaMS / 1000;
    this.game.events.emit('time-updated', this.timeLeft);
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    this.game.events.emit('health-changed', this.health);
    
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  addScore(points) {
    this.score += points;
    this.game.events.emit('score-changed', this.score);
  }

  clearPortal() {
    this.game.events.emit('portal-cleared');
  }
}
*/

// ============================================
// PROP REFERENCE
// ============================================

/*
GameHUD Props:

- health (number, default: 3)
  Current player health
  
- maxHealth (number, default: 3)
  Maximum health (determines number of hearts shown)
  
- score (number, default: 0)
  Current score value
  
- portalsCleared (number, default: 0)
  Number of portals the player has cleared
  
- maxPortals (number, default: 5)
  Total number of portals in the game
  
- difficulty (string, default: 'HARD')
  Difficulty display text (e.g., 'EASY', 'NORMAL', 'HARD')
  
- timeLeft (number, default: 300)
  Remaining time in seconds
  
- maxTime (number, default: 300)
  Maximum/initial time in seconds

Example usage:
<GameHUD
  health={3}
  maxHealth={3}
  score={15000}
  portalsCleared={2}
  maxPortals={5}
  difficulty="HARD"
  timeLeft={145}
  maxTime={300}
/>
*/

// ============================================
// STYLING CUSTOMIZATION
// ============================================

/*
You can customize the HUD appearance by modifying 
the CSS variables in GameHUD.css:

:root {
  --hud-bg: #0a0a0a;           // Background color
  --hud-border: #ff2a2a;        // Border color (red)
  --hud-glow: ...;              // Glow effect
  --box-gap: 12px;              // Space between boxes
}

Or override with a custom CSS file:

.game-hud-container {
  --hud-border: #00ff00;        // Change to green
  --hud-glow: 0 0 10px rgba(0, 255, 0, 0.6);
}
*/

export default {
  // This file is documentation only
  // No default export
};
