import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame from '../components/PhaserGame';
import QuestionOverlay from '../components/QuestionOverlay';
import ResultOverlay from '../components/ResultOverlay';
import GameHUD from '../components/GameHUD';
import { useGame } from '../context/GameContext';
import { resetUsedQuestions } from '../data/mockData';

const GameScreen = () => {
  const navigate = useNavigate();
  const { gameStatus, startGame, health, globalTimeLeft, score, portalsCleared, timeSurvived, difficulty, maxPortals = 5 } = useGame();
  const gameStartedRef = React.useRef(false);

  const username = localStorage.getItem('username');

  console.log(`[GameScreen RENDER] username: ${username}, gameStatus: ${gameStatus}, health: ${health}, globalTimeLeft: ${globalTimeLeft}, score: ${score}, portalsCleared: ${portalsCleared}`);

  // Initialize game on mount
  useEffect(() => {
    const playerId = sessionStorage.getItem('playerId');
    const playerPassword = sessionStorage.getItem('playerPassword');
    const currentUsername = localStorage.getItem('username');

    console.log('[GameScreen] Init check:', { playerId, playerPassword, currentUsername });

    if (!playerId || !playerPassword) {
      console.warn('[GameScreen] No playerId or playerPassword, redirecting');
      navigate('/');
      return;
    }

    // Verify playerId matches current username (avoid stale sessionStorage)
    if (playerId !== currentUsername) {
      console.warn('[GameScreen] sessionStorage stale! playerId:', playerId, 'currentUsername:', currentUsername);
      // Update sessionStorage with current username
      sessionStorage.setItem('playerId', currentUsername);
    }

    // Reset questions and start game
    console.log('[GameScreen] Starting game for player:', playerId);
    resetUsedQuestions();
    startGame(playerId, playerPassword);
    gameStartedRef.current = true;
  }, [navigate, startGame]);

  // Check for game over conditions (only after game has actually started)
  useEffect(() => {
    if (!gameStartedRef.current) {
      console.log('[GameScreen] Game not started yet, skipping gameover check');
      return;
    }

    // Only trigger game over if conditions are met AND game was actually started
    if ((gameStatus === 'ended' || health <= 0 || globalTimeLeft <= 0) && gameStartedRef.current) {
      console.log('[GameScreen] Game Over Detected - navigating to gameover. Final score:', score, 'portalsCleared:', portalsCleared, 'timeSurvived:', timeSurvived);
      // Small delay to show final state
      const timer = setTimeout(() => {
        gameStartedRef.current = false;
        navigate('/gameover');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, health, globalTimeLeft, navigate, score, portalsCleared, timeSurvived]);

  return (
    <div 
      data-testid="game-screen"
      className="min-h-screen bg-black relative overflow-hidden"
    >
      {/* HUD Bar */}
      <GameHUD
        health={health}
        maxHealth={3}
        score={score}
        portalsCleared={portalsCleared}
        maxPortals={maxPortals}
        difficulty={difficulty?.name || 'HARD'}
        timeLeft={globalTimeLeft}
        maxTime={7200}
      />
      
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-black to-red-950/5"></div>
      </div>

      {/* Main Game Container */}
      <div className="pt-32 pb-6 px-4 h-[100vh] flex flex-col items-center justify-center relative z-10">
        {/* Dimension Status - Above border */}
        <div className="mb-6">
          <p className="font-vt323 text-white text-sm tracking-widest text-center drop-shadow-lg drop-shadow-white/50">
            DIMENSION: UPSIDE DOWN
          </p>
        </div>

        {/* Game Area with Enhanced Neon Border */}
        <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center">
          {/* Outer glow effect */}
          <div className="absolute inset-0 border-4 border-red-600 shadow-2xl shadow-red-600/60 rounded-sm"></div>
          
          {/* Top corner left */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-red-600 shadow-lg shadow-red-600/60"></div>
          {/* Top corner right */}
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-red-600 shadow-lg shadow-red-600/60"></div>
          {/* Bottom corner left */}
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-red-600 shadow-lg shadow-red-600/60"></div>
          {/* Bottom corner right */}
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-red-600 shadow-lg shadow-red-600/60"></div>

          {/* Inner game canvas with dark overlay */}
          <div className="relative w-full h-full z-10 bg-black overflow-hidden">
            <PhaserGame />
            
            {/* Particle effects overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-600 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.5 + 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar with Enhanced Neon Styling */}
        <div className="mt-6 w-full max-w-6xl flex justify-between items-center px-8 py-4 border-t-4 border-b-4 border-red-600 relative shadow-lg shadow-red-600/50">
          {/* Decorative angled lines left */}
          <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center gap-1">
            <div className="w-1 h-full bg-gradient-to-r from-red-600 to-transparent"></div>
            <div className="w-0.5 h-3/4 bg-red-600 rotate-45 opacity-60"></div>
          </div>
          
          {/* Decorative angled lines right */}
          <div className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-end gap-1">
            <div className="w-0.5 h-3/4 bg-red-600 -rotate-45 opacity-60"></div>
            <div className="w-1 h-full bg-gradient-to-l from-red-600 to-transparent"></div>
          </div>
          
          {/* Status items */}
          <span className="text-white font-code text-xs uppercase tracking-widest font-bold drop-shadow-lg drop-shadow-white/50">AUTO-RUN ENGAGED</span>
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"></div>
            <span className="text-white font-code text-xs uppercase tracking-widest font-bold animate-pulse drop-shadow-lg drop-shadow-white/50">PORTAL ANOMALIES DETECTED</span>
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"></div>
          </div>
          
          <span className="text-white font-code text-xs uppercase tracking-widest font-bold drop-shadow-lg drop-shadow-white/50">SURVIVAL MODE ACTIVE</span>
        </div>
      </div>

      {/* Question Overlay */}
      <QuestionOverlay />

      {/* Result Overlay */}
      <ResultOverlay />
    </div>
  );
};

export default GameScreen;
