import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Zap, Heart, Gift } from 'lucide-react';
import { useGame } from '../context/GameContext';

const ResultOverlay = () => {
  const { showResultOverlay, lastResult, closeResultOverlay } = useGame();

  // Auto-close after 2 seconds
  useEffect(() => {
    if (!showResultOverlay) return;

    const timer = setTimeout(() => {
      closeResultOverlay();
    }, 2000);

    return () => clearTimeout(timer);
  }, [showResultOverlay, closeResultOverlay]);

  if (!showResultOverlay || !lastResult) return null;

  const isCorrect = lastResult.correct;
  const isTimeout = lastResult.timeout;

  return (
    <div 
      data-testid="result-overlay"
      className={`fixed inset-0 z-[200] flex items-center justify-center ${
        isCorrect ? 'animate-stabilize' : 'animate-red-flash bg-black/95'
      }`}
    >
      <div className={`text-center p-12 ${
        isCorrect 
          ? 'border-2 border-green-500 box-glow-green bg-black/90' 
          : 'border-2 border-red-600 box-glow-red bg-black/90'
      } ${!isCorrect ? 'animate-demogorgon' : ''}`}>
        
        {/* Icon */}
        <div className="mb-6">
          {isCorrect ? (
            <CheckCircle data-testid="result-correct-icon" className="w-24 h-24 mx-auto text-green-500 text-glow-green" />
          ) : (
            <XCircle data-testid="result-wrong-icon" className="w-24 h-24 mx-auto text-red-500 text-glow-red" />
          )}
        </div>

        {/* Main message */}
        <h2 className={`font-horror text-4xl mb-4 tracking-wider ${
          isCorrect ? 'text-green-400 text-glow-green' : 'text-red-500 text-glow-red'
        }`}>
          {isCorrect ? 'PORTAL STABILIZED' : isTimeout ? 'TIME EXPIRED' : 'WRONG CIPHER'}
        </h2>

        {/* Story text */}
        <p data-testid="result-message" className="font-vt323 text-xl text-gray-300 mb-6 max-w-md mx-auto">
          {isCorrect 
            ? 'Reality restored. The pathway clears momentarily...'
            : 'The Demogorgon senses your weakness. It attacks!'
          }
        </p>

        {/* Score change */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className={`w-5 h-5 ${lastResult.scoreDelta >= 0 ? 'text-yellow-400' : 'text-red-400'}`} />
          <span className={`font-vt323 text-2xl ${
            lastResult.scoreDelta >= 0 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {lastResult.scoreDelta >= 0 ? '+' : ''}{lastResult.scoreDelta} POINTS
          </span>
        </div>

        {/* Health indicator for wrong answer */}
        {!isCorrect && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-vt323 text-xl text-red-400">
              Health: {lastResult.newHealth} / 3
            </span>
          </div>
        )}

        {/* Power-up notification */}
        {lastResult.powerUp && (
          <div data-testid="powerup-notification" className="flex items-center justify-center gap-3 mt-4 p-3 bg-purple-900/30 border border-purple-500 rounded">
            <Gift className="w-6 h-6 text-purple-400" />
            <span className="font-vt323 text-lg text-purple-300">
              {lastResult.powerUp === 'hawkins_stabilizer' && 'HAWKINS STABILIZER - Speed x0.5 for 10s!'}
              {lastResult.powerUp === 'lab_medkit' && 'LAB MED-KIT - +1 Health!'}
              {lastResult.powerUp === 'signal_booster' && 'SIGNAL BOOSTER - 2x Score for 20s!'}
            </span>
          </div>
        )}

        {/* Continue/Game Over indicator */}
        {!lastResult.continueGame && (
          <div className="mt-6 text-red-500 font-horror text-2xl animate-pulse">
            GAME OVER
          </div>
        )}

        {/* Demogorgon silhouette for wrong answers */}
        {!isCorrect && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
              style={{
                background: 'radial-gradient(circle, transparent 30%, rgba(255,0,0,0.3) 70%, transparent 100%)',
                filter: 'blur(20px)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultOverlay;
