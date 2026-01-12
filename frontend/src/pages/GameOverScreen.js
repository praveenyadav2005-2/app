import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skull, Target, Clock, Zap, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGame } from '../context/GameContext';
import API_URL from '../config';

const GameOverScreen = () => {
  const navigate = useNavigate();
  const gameContext = useGame();
  const { score, portalsCleared, timeSurvived, health } = gameContext;
  
  // Use current username from localStorage, not just from context
  const username = localStorage.getItem('username') || gameContext.username;
  
  console.log('GameOverScreen - username from localStorage:', localStorage.getItem('username'));
  console.log('GameOverScreen - username from context:', gameContext.username);
  console.log('GameOverScreen - using username:', username);
  console.log('GameOverScreen - score:', score, 'type:', typeof score);
  console.log('GameOverScreen - portalsCleared:', portalsCleared);
  console.log('GameOverScreen - timeSurvived:', timeSurvived);
  console.log('GameOverScreen - health:', health);
  
  const [showStats, setShowStats] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreError, setScoreError] = useState('');

  useEffect(() => {
    // Animate stats appearance
    const timer = setTimeout(() => setShowStats(true), 500);

    // Save score to database (even if score is 0)
    if (username) {
      saveScoreToDB();
    }

    return () => clearTimeout(timer);
  }, [username, score, portalsCleared, timeSurvived]);

  const saveScoreToDB = async () => {
    setIsSavingScore(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); // Debug log
      
      if (!token) {
        setScoreError('No authentication token found. Please login again.');
        console.error('Token not found in localStorage');
        return;
      }

      console.log('📤 Sending score to backend:', { score, portalsCleared, timeSurvived, username });

      const response = await fetch(`${API_URL}/api/game/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: score,
          portalsCleared: portalsCleared,
          timeSurvived: timeSurvived
        })
      });

      const data = await response.json();
      console.log('✅ Score save response:', data);

      if (!response.ok) {
        setScoreError(data.message || 'Failed to save score');
        console.error('❌ Score save error:', data);
      } else {
        console.log('✅ Score saved successfully for user:', username);
      }
    } catch (err) {
      setScoreError('Network error: Could not save score');
      console.error('❌ Score save network error:', err);
    } finally {
      setIsSavingScore(false);
    }
  };

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
                {`${Math.floor(timeSurvived / 60)}m ${timeSurvived % 60}s`}
              </span>
            </div>

            {/* Score Save Status */}
            {isSavingScore && (
              <div className="flex items-center justify-between p-3 bg-blue-950/30 border border-blue-600">
                <span className="font-vt323 text-lg text-blue-300">Saving Score...</span>
                <span className="animate-pulse text-blue-400">●</span>
              </div>
            )}

            {scoreError && (
              <div className="flex items-center justify-between p-3 bg-red-950/30 border border-red-600">
                <span className="font-vt323 text-lg text-red-300">{scoreError}</span>
              </div>
            )}

            {!isSavingScore && !scoreError && (
              <div className="flex items-center justify-between p-3 bg-green-950/30 border border-green-600">
                <span className="font-vt323 text-lg text-green-300">✓ Score Saved</span>
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
          SUBJECT: {username || 'UNKNOWN'}
        </p>
      </div>
    </div>
  );
};

export default GameOverScreen;
