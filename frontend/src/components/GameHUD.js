import React, { useMemo } from 'react';
import './GameHUD.css';

/**
 * CircularTimer Component
 * Displays a countdown timer in a circular progress ring
 */
const CircularTimer = ({ timeLeft, maxTime = 300 }) => {
  // Calculate progress percentage
  const progress = Math.max(0, Math.min(timeLeft / maxTime, 1));
  const circumference = 2 * Math.PI * 32; // radius = 32px
  const strokeDashoffset = circumference * (1 - progress);

  // Determine if time is critically low (< 30 seconds)
  const isLowTime = timeLeft < 30;

  // Convert seconds to hrs format
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="hud-timer-circle">
      <svg className="timer-svg" viewBox="0 0 70 70">
        {/* Background circle */}
        <circle
          className="timer-background"
          cx="35"
          cy="35"
          r="32"
        />
        {/* Progress ring */}
        <circle
          className="timer-progress"
          cx="35"
          cy="35"
          r="32"
          style={{ strokeDashoffset }}
        />
      </svg>
      {/* Timer text in center */}
      <div className={`timer-text ${isLowTime ? 'low-time' : ''}`}>
        {timeDisplay}
      </div>
    </div>
  );
};

/**
 * HealthBar Component
 * Displays health as a series of hearts
 */
const HealthBar = ({ health, maxHealth = 3 }) => {
  return (
    <div className="health-bar-container">
      {Array.from({ length: maxHealth }).map((_, i) => (
        <div
          key={i}
          className={`health-heart ${i < health ? 'active' : 'inactive'}`}
        >
          ❤
        </div>
      ))}
    </div>
  );
};

/**
 * GameHUD Component
 * Main HUD overlay with all game information
 * Props:
 *  - health: current health (0-3)
 *  - maxHealth: maximum health (default 3)
 *  - score: current score
 *  - portalsCleared: number of portals cleared
 *  - maxPortals: total portals
 *  - difficulty: current difficulty text (e.g., "EASY", "NORMAL", "HARD")
 *  - timeLeft: remaining time in seconds
 *  - maxTime: maximum time (default 300)
 */
const GameHUD = ({
  health = 3,
  maxHealth = 3,
  score = 0,
  portalsCleared = 0,
  maxPortals = 5,
  difficulty = 'HARD',
  timeLeft = 300,
  maxTime = 300,
}) => {
  // Check if health is critical
  const isCritical = health <= 1;

  return (
    <div className={`game-hud-container ${isCritical ? 'hud-critical' : ''}`}>
      {/* Health Box */}
      <div className="hud-box hud-health">
        <div className="hud-box-label">Health</div>
        <HealthBar health={health} maxHealth={maxHealth} />
      </div>

      {/* Score Box */}
      <div className="hud-box hud-score">
        <div className="hud-box-label">Score</div>
        <div className="hud-box-content score-value">
          {score.toLocaleString()}
        </div>
      </div>

      {/* Portals Box */}
      <div className="hud-box hud-portals">
        <div className="hud-box-label">Portals</div>
        <div className="hud-box-content portals-value">
          {portalsCleared} / {maxPortals}
        </div>
      </div>

      {/* Mode Box */}
      <div className="hud-box hud-mode">
        <div className="hud-box-label">Mode</div>
        <div className="hud-box-content mode-value">
          {difficulty}
        </div>
      </div>

      {/* Circular Timer */}
      <CircularTimer timeLeft={Math.ceil(timeLeft)} maxTime={maxTime} />
    </div>
  );
};

export default GameHUD;
