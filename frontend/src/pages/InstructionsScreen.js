import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Target, Clock, Zap, AlertTriangle, Gift, Play, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGame } from '../context/GameContext';
import API_URL from '../config';

const InstructionsScreen = () => {
  const navigate = useNavigate();
  const gameContext = useGame();
  const [gameAlreadyCompleted, setGameAlreadyCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [checkError, setCheckError] = useState('');

  // Force GameContext to sync with current user on mount
  React.useEffect(() => {
    const currentUsername = localStorage.getItem('username');
    console.log('📋 [InstructionsScreen Mount] Current username:', currentUsername);
    console.log('📋 [InstructionsScreen Mount] GameContext username:', gameContext.username);
    
    // Force a check by reading directly from localStorage
    if (currentUsername !== gameContext.username) {
      console.warn('⚠️ [InstructionsScreen] GameContext out of sync! Forcing update...');
      // Trigger by setting and clearing a dummy value to force context to update
      // This is a workaround to force the GameContext to resync
      window.dispatchEvent(new Event('gameContextSync'));
    }
  }, []);

  // Check if user has already completed the game
  useEffect(() => {
    const checkGameStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        console.log('🔍 Checking game status for:', username);
        console.log('📋 Token exists:', token ? 'YES' : 'NO');
        
        if (!token) {
          console.warn('⚠️ No token found, redirecting to login');
          navigate('/');
          return;
        }

        const response = await fetch(`${API_URL}/api/game/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('📊 Game status response:', data);

        if (data.success && !data.canPlay) {
          console.log('🚫 User has already completed the game');
          setGameAlreadyCompleted(true);
          setCheckError('You have already completed the game! Check the leaderboard to see your rank.');
        } else if (data.success) {
          console.log('✅ User can play the game');
        }
      } catch (err) {
        console.error('❌ Error checking game status:', err);
        setCheckError('Could not verify game status. Proceed at your own risk.');
      } finally {
        setIsChecking(false);
      }
    };

    checkGameStatus();
  }, [navigate]);

  const handleStart = () => {
    if (gameAlreadyCompleted) {
      navigate('/leaderboard');
    } else {
      navigate('/game');
    }
  };

  return (
    <div 
      data-testid="instructions-screen"
      className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-red-950/10" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-horror text-4xl sm:text-5xl text-red-500 text-glow-red tracking-wider mb-4">
            MISSION BRIEFING
          </h1>
          <div className="w-32 h-1 bg-red-600 mx-auto" />
        </div>

        {/* Story section */}
        <div className="bg-black/80 border border-red-900/50 p-6 mb-8">
          <p className="font-vt323 text-xl text-gray-300 leading-relaxed text-center">
            You have been pulled into the <span className="text-red-400">UPSIDE DOWN</span>.
            <br />
            Navigate through obstacles and solve coding challenges to survive.
            <br />
            <span className="text-yellow-400">Defeat the Demogorgons. Solve the ciphers. Escape!</span>
          </p>
        </div>

        {/* Instructions grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Health */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Heart className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">LIVES</h3>
              <p className="font-vt323 text-gray-400">
                You start with 3 lives. Answering questions incorrectly costs 1 life.
                Game ends at 0 lives. Use your lives wisely!
              </p>
            </div>
          </div>

          {/* Questions/Bonuses */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Target className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">QUESTIONS</h3>
              <p className="font-vt323 text-gray-400">
                Collect bonuses to trigger questions. Solve them correctly to earn points.
                Total: 5 EASY, 5 MEDIUM, 5 HARD questions available.
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Clock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">TIME LIMITS</h3>
              <p className="font-vt323 text-gray-400">
                <span className="text-green-400">EASY: 20 min</span> • 
                <span className="text-orange-400"> MEDIUM: 30 min</span> • 
                <span className="text-red-400"> HARD: 40 min</span>
                <br />
                Total game time: 2 hours
              </p>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">SCORING</h3>
              <p className="font-vt323 text-gray-400">
                <span className="text-green-400">EASY: +100 pts</span>
                <br />
                <span className="text-orange-400">MEDIUM: +150 pts</span>
                <br />
                <span className="text-red-400">HARD: +200 pts</span>
              </p>
            </div>
          </div>

          {/* Obstacles */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-orange-400 mb-2">DEMOGORGONS (OBSTACLES)</h3>
              <p className="font-vt323 text-gray-400">
                Demogorgons approach from the right side.
                <br />
                Hit them and lose 2 points. Avoid using SPACEBAR!
              </p>
            </div>
          </div>

          {/* Bonuses */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Gift className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-purple-400 mb-2">BONUSES</h3>
              <p className="font-vt323 text-gray-400">
                Collect bonuses in the game to trigger questions.
                <br />
                Solve them correctly to earn points and advance.
              </p>
            </div>
          </div>
        </div>

        {/* Important note */}
        <div className="bg-red-950/30 border border-red-600 p-4 mb-8">
          <p className="font-vt323 text-lg text-red-400 text-center">
            <AlertTriangle className="inline w-5 h-5 mr-2" />
            All answers are TEXT INPUT. Type your answer exactly. Case insensitive.
          </p>
        </div>

        {/* Game already completed alert */}
        {gameAlreadyCompleted && (
          <div className="bg-orange-950/50 border border-orange-600 p-4 mb-8">
            <p className="font-vt323 text-lg text-orange-400 text-center flex items-center justify-center">
              <AlertCircle className="inline w-5 h-5 mr-2" />
              {checkError}
            </p>
          </div>
        )}

        {/* Start button */}
        <div className="text-center">
          {isChecking ? (
            <p className="font-vt323 text-lg text-gray-400 animate-pulse">
              VERIFYING GAME STATUS...
            </p>
          ) : (
            <>
              <Button
                data-testid="start-game-btn"
                onClick={handleStart}
                className={`game-button text-2xl px-12 py-4 ${!gameAlreadyCompleted ? 'animate-pulse-glow' : ''}`}
              >
                <Play className="inline w-6 h-6 mr-3" />
                {gameAlreadyCompleted ? 'VIEW LEADERBOARD' : 'RUN'}
              </Button>
              
              <p className="mt-4 font-code text-xs text-red-600/60">
                {gameAlreadyCompleted 
                  ? 'VIEW YOUR RANK AND STATS'
                  : 'PRESS TO INITIATE DIMENSIONAL ESCAPE SEQUENCE'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;
