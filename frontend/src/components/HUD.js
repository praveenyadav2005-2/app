import React from 'react';
import { Heart, Zap, Clock, Target } from 'lucide-react';
import { useGame, MAX_HEALTH } from '../context/GameContext';
import { formatLongTime } from '../data/mockData';

const HUD = () => {
  const { health, score, globalTimeLeft, portalsCleared, activePowerUps, difficulty } = useGame();

  return (
    <div 
      data-testid="game-hud"
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-red-600 shadow-lg shadow-red-600/50"
    >
      {/* Top decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      
      <div className="px-6 py-3 flex items-center justify-around gap-12 text-xs">
        {/* Health */}
        <div data-testid="health-display" className="flex items-center gap-2">
          <span className="text-gray-500 font-code uppercase tracking-widest">Health</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_HEALTH }).map((_, i) => (
              <Heart
                key={i}
                data-testid={`health-heart-${i}`}
                className={`w-5 h-5 ${i < health ? 'fill-red-500 text-red-500 drop-shadow-lg drop-shadow-red-500/50' : 'text-gray-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Score */}
        <div data-testid="score-display" className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-500 font-code uppercase tracking-widest">Score</span>
          <p className="text-yellow-400 font-code font-bold">{score.toLocaleString()}</p>
        </div>

        {/* Portals */}
        <div data-testid="portals-display" className="flex items-center gap-2">
          <Target className="w-4 h-4 text-red-500" />
          <span className="text-gray-500 font-code uppercase tracking-widest">Portals</span>
          <p className="text-red-400 font-code font-bold">{portalsCleared}</p>
        </div>

        {/* Difficulty */}
        <div data-testid="difficulty-display" className="flex items-center gap-2">
          <span className="text-gray-500 font-code uppercase tracking-widest">Difficulty</span>
          <p className={`font-code font-bold ${
            difficulty.name === 'HARD' ? 'text-red-500' :
            difficulty.name === 'MEDIUM' ? 'text-orange-400' :
            'text-green-400'
          }`}>
            {difficulty.name}
          </p>
        </div>

        {/* Time Left */}
        <div data-testid="time-display" className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${globalTimeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-gray-500 font-code uppercase tracking-widest">Time Left</span>
          <p className={`font-code font-bold ${
            globalTimeLeft < 300 ? 'text-red-500 animate-flicker' : 'text-gray-300'
          }`}>
            {formatLongTime(globalTimeLeft)}
          </p>
        </div>

        {/* Active Power-ups */}
        {activePowerUps.length > 0 && (
          <div data-testid="powerups-display" className="flex items-center gap-3 px-4 py-2 bg-purple-950/20 border border-purple-900/40 rounded">
            <span className="text-gray-400 text-xs font-code uppercase tracking-widest">Active:</span>
            <div className="flex gap-2">
              {activePowerUps.map((powerUp, i) => (
                <div 
                  key={i}
                  className="px-3 py-1 bg-purple-900/40 border border-purple-500/60 rounded text-xs font-code text-purple-300 powerup-active font-bold"
                >
                  {powerUp.type === 'hawkins_stabilizer' && '🔷 SLOW'}
                  {powerUp.type === 'signal_booster' && '⚡ 2X SCORE'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
