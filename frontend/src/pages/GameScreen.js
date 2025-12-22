import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HUD from '../components/HUD';
import PhaserGame from '../components/PhaserGame';
import QuestionOverlay from '../components/QuestionOverlay';
import ResultOverlay from '../components/ResultOverlay';
import { useGame } from '../context/GameContext';
import { resetUsedQuestions } from '../data/mockData';

const GameScreen = () => {
  const navigate = useNavigate();
  const { gameStatus, startGame, health, globalTimeLeft } = useGame();

  // Initialize game on mount
  useEffect(() => {
    const playerId = sessionStorage.getItem('playerId');
    const playerPassword = sessionStorage.getItem('playerPassword');

    if (!playerId || !playerPassword) {
      navigate('/');
      return;
    }

    // Reset questions and start game
    resetUsedQuestions();
    startGame(playerId, playerPassword);
  }, [navigate, startGame]);

  // Check for game over conditions
  useEffect(() => {
    if (gameStatus === 'ended' || health <= 0 || globalTimeLeft <= 0) {
      // Small delay to show final state
      const timer = setTimeout(() => {
        navigate('/gameover');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, health, globalTimeLeft, navigate]);

  return (
    <div 
      data-testid="game-screen"
      className="min-h-screen bg-black relative overflow-hidden"
    >
      {/* HUD */}
      <HUD />

      {/* Game Area */}
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {/* Story/atmosphere text */}
        <div className="text-center mb-4">
          <p className="font-vt323 text-gray-500 text-lg tracking-wider">
            // DIMENSION: UPSIDE DOWN // STATUS: UNSTABLE //
          </p>
        </div>

        {/* Phaser Game Container */}
        <PhaserGame />

        {/* Bottom info */}
        <div className="mt-4 flex justify-between items-center text-gray-600 font-code text-sm">
          <span>AUTO-RUN ENGAGED</span>
          <span className="animate-pulse">PORTAL ANOMALIES DETECTED</span>
          <span>SURVIVAL MODE ACTIVE</span>
        </div>
      </div>

      {/* Question Overlay */}
      <QuestionOverlay />

      {/* Result Overlay */}
      <ResultOverlay />

      {/* Atmospheric effects */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-950/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default GameScreen;
