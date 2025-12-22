import React from 'react';
import { Heart, Zap, Clock, Target } from 'lucide-react';
import { useGame, MAX_HEALTH } from '../context/GameContext';
import { formatLongTime } from '../data/mockData';

const HUD = () => {
  const { health, score, globalTimeLeft, portalsCleared, activePowerUps, difficulty } = useGame();

  return (
    <div 
      data-testid="game-hud"
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b-2 border-red-900/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Health */}
        <div data-testid="health-display" className="flex items-center gap-2">
          <span className="text-gray-500 text-sm font-vt323 uppercase tracking-wider mr-2">Health</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_HEALTH }).map((_, i) => (
              <Heart
                key={i}
                data-testid={`health-heart-${i}`}
                className={`w-6 h-6 ${i < health ? 'health-heart fill-red-600' : 'health-heart-empty'}`}
              />
            ))}
          </div>
        </div>

        {/* Score */}
        <div data-testid="score-display" className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <div className="text-center">
            <span className="text-gray-500 text-xs font-vt323 uppercase tracking-wider">Score</span>
            <p className="text-2xl font-vt323 text-yellow-400 text-glow-red">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* Portals Cleared */}
        <div data-testid="portals-display" className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-500" />
          <div className="text-center">
            <span className="text-gray-500 text-xs font-vt323 uppercase tracking-wider">Portals</span>
            <p className="text-2xl font-vt323 text-red-400">{portalsCleared}</p>
          </div>
        </div>

        {/* Difficulty */}
        <div data-testid="difficulty-display" className="text-center">
          <span className="text-gray-500 text-xs font-vt323 uppercase tracking-wider">Difficulty</span>
          <p className={`text-lg font-vt323 ${
            difficulty.name === 'HARD' ? 'text-red-500 animate-pulse' :
            difficulty.name === 'MEDIUM' ? 'text-orange-400' :
            'text-green-400'
          }`}>
            {difficulty.name}
          </p>
        </div>

        {/* Time Left */}
        <div data-testid="time-display" className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${globalTimeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <div className="text-center">
            <span className="text-gray-500 text-xs font-vt323 uppercase tracking-wider">Time Left</span>
            <p className={`text-2xl font-vt323 font-code ${
              globalTimeLeft < 300 ? 'text-red-500 animate-flicker' : 'text-gray-300'
            }`}>
              {formatLongTime(globalTimeLeft)}
            </p>
          </div>
        </div>

        {/* Active Power-ups */}
        {activePowerUps.length > 0 && (
          <div data-testid="powerups-display" className="flex items-center gap-2">
            {activePowerUps.map((powerUp, i) => (
              <div 
                key={i}
                className="px-2 py-1 bg-purple-900/50 border border-purple-500 rounded text-xs font-vt323 text-purple-300 powerup-active"
              >
                {powerUp.type === 'hawkins_stabilizer' && '🔷 SLOW'}
                {powerUp.type === 'signal_booster' && '⚡ 2X SCORE'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
