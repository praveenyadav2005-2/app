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
    
    // Force a check by reading directly from localStorage
    if (currentUsername !== gameContext.username) {
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
        
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch(`${API_URL}/api/game/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success && !data.canPlay) {
          setGameAlreadyCompleted(true);
          setCheckError('You have already completed the game! Check the leaderboard to see your rank.');
        }
      } catch (err) {
        console.error('Error checking game status:', err);
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
            You have <span className="text-red-400">2 HOURS</span> to escape the UPSIDE DOWN.
            <br />
            Solve <span className="text-yellow-400">5 EASY, 5 MEDIUM, and 5 HARD</span> questions to survive.
            <br />
            Red balls are bonuses that unlock questions for solving and earning score.
            <br />
            <span className="text-yellow-400">Avoid Demogorgons with SPACE BAR or lose 2 points!</span>
          </p>
        </div>

        {/* Instructions grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Health */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Heart className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">LIVES SYSTEM</h3>
              <p className="font-vt323 text-gray-400">
                You start with <span className="text-yellow-400">5 LIVES</span>. Use the <span className="text-red-400">"SAVE ME"</span> option to skip a question and use 1 life.
                <br />
                If the question timer runs out, you lose 1 life. Game ends at 0 lives.
              </p>
            </div>
          </div>

          {/* Portals */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Target className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">QUESTIONS</h3>
              <p className="font-vt323 text-gray-400">
                Solve <span className="text-green-400">5 EASY</span>, <span className="text-orange-400">5 MEDIUM</span>, and <span className="text-red-400">5 HARD</span> questions to finish the game.
                <br />
                Red balls are bonuses that open up questions for solving and earning score!
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Clock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">TIME LIMITS</h3>
              <p className="font-vt323 text-gray-400">
                <span className="text-green-400">EASY: 20 mins</span> • 
                <span className="text-orange-400"> MEDIUM: 30 mins</span> • 
                <span className="text-red-400"> HARD: 40 mins</span>
                <br />
                Global time limit: <span className="text-red-400 font-bold">2 HOURS</span>
              </p>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">SCORING</h3>
              <p className="font-vt323 text-gray-400">
                <span className="text-green-400">EASY: 100 pts</span>
                <br />
                <span className="text-orange-400">MEDIUM: 200 pts</span>
                <br />
                <span className="text-red-400">HARD: 300 pts</span>
              </p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-orange-400 mb-2">DEMOGORGONS</h3>
              <p className="font-vt323 text-gray-400">
                Demogorgons are obstacles in your path.
                <br />
                Press <span className="text-yellow-400">SPACE BAR</span> to escape them. Colliding with them costs you <span className="text-red-400">2 POINTS</span>!
              </p>
            </div>
          </div>
        </div>

        {/* Important note */}
        <div className="bg-red-950/30 border border-red-600 p-4 mb-8">
          <p className="font-vt323 text-lg text-red-400 text-center">
            <AlertTriangle className="inline w-5 h-5 mr-2" />
            MISSION: Clear 5 EASY + 5 MEDIUM + 5 HARD questions within 2 hours. Manage your 5 lives wisely!
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