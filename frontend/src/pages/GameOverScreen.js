import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skull, Target, Clock, Zap, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGame } from '../context/GameContext';
import { formatLongTime, addToLeaderboard } from '../data/mockData';

const GameOverScreen = () => {
  const navigate = useNavigate();
  const { playerId, score, portalsCleared, timeSurvived, health } = useGame();
  const [playerRank, setPlayerRank] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Animate stats appearance
    const timer = setTimeout(() => setShowStats(true), 500);

    // Calculate player rank
    if (playerId) {
      const updatedLeaderboard = addToLeaderboard({
        name: playerId,
        rollNo: 'PLAYER',
        score,
        portalsCleared,
        timeSurvived,
      });
      
      const playerEntry = updatedLeaderboard.find(entry => entry.name === playerId);
      if (playerEntry) {
        setPlayerRank(playerEntry.rank);
      }
    }

    return () => clearTimeout(timer);
  }, [playerId, score, portalsCleared, timeSurvived]);

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  const isVictory = health > 0;

  return (
    <div 
      data-testid="gameover-screen"
      className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className={`absolute inset-0 ${
        isVictory 
          ? 'bg-gradient-to-b from-green-950/20 via-black to-green-950/10'
          : 'bg-gradient-to-b from-red-950/30 via-black to-red-950/20'
      }`} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${isVictory ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 ${
        showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Icon */}
        <div className="text-center mb-6">
          {isVictory ? (
            <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-float" />
          ) : (
            <Skull className="w-24 h-24 mx-auto text-red-500 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <h1 className={`font-horror text-5xl text-center mb-4 tracking-wider ${
          isVictory ? 'text-green-400 text-glow-green' : 'text-red-500 text-glow-red'
        }`}>
          {isVictory ? 'TIME UP' : 'GAME OVER'}
        </h1>

        {/* Story message */}
        <p className="font-vt323 text-xl text-gray-400 text-center mb-8">
          {isVictory 
            ? 'The dimensional rift closes. You survived the Upside Down.'
            : 'You are lost in the Upside Down. The Demogorgon claims another victim.'
          }
        </p>

        {/* Stats card */}
        <div className={`bg-black/80 border-2 p-8 mb-8 ${
          isVictory ? 'border-green-600 box-glow-green' : 'border-red-600 box-glow-red'
        }`}>
          <h2 className="font-vt323 text-2xl text-gray-300 text-center mb-6 uppercase tracking-wider">
            Mission Report
          </h2>

          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between p-3 bg-black/50 border border-gray-800">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="font-vt323 text-lg text-gray-400">Final Score</span>
              </div>
              <span data-testid="final-score" className="font-vt323 text-2xl text-yellow-400">
                {score.toLocaleString()}
              </span>
            </div>

            {/* Portals */}
            <div className="flex items-center justify-between p-3 bg-black/50 border border-gray-800">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-red-500" />
                <span className="font-vt323 text-lg text-gray-400">Portals Stabilized</span>
              </div>
              <span data-testid="portals-cleared" className="font-vt323 text-2xl text-red-400">
                {portalsCleared}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between p-3 bg-black/50 border border-gray-800">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-gray-400" />
                <span className="font-vt323 text-lg text-gray-400">Time Survived</span>
              </div>
              <span data-testid="time-survived" className="font-vt323 text-2xl text-gray-300">
                {formatLongTime(timeSurvived)}
              </span>
            </div>

            {/* Rank preview */}
            {playerRank && (
              <div className="flex items-center justify-between p-3 bg-purple-950/30 border border-purple-600">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <span className="font-vt323 text-lg text-purple-300">Your Rank</span>
                </div>
                <span className="font-vt323 text-2xl text-purple-400">
                  #{playerRank}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            data-testid="view-leaderboard-btn"
            onClick={handleViewLeaderboard}
            className="flex-1 game-button"
          >
            <Trophy className="inline w-5 h-5 mr-2" />
            VIEW LEADERBOARD
          </Button>
          
          <Button
            data-testid="play-again-btn"
            onClick={handlePlayAgain}
            className="flex-1 game-button border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-black hover:border-gray-600"
          >
            TRY AGAIN
          </Button>
        </div>

        {/* Player ID */}
        <p className="mt-6 text-center font-code text-sm text-gray-600">
          SUBJECT: {playerId || 'UNKNOWN'}
        </p>
      </div>
    </div>
  );
};

export default GameOverScreen;
