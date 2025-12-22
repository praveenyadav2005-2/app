import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Target, Clock, Zap, AlertTriangle, Gift, Play } from 'lucide-react';
import { Button } from '../components/ui/button';

const InstructionsScreen = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/game');
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
            The only way out is through corrupted portals that block your path.
            <br />
            Each portal contains a <span className="text-red-400">CIPHER</span> that must be decoded.
            <br />
            <span className="text-yellow-400">Solve them to survive. Fail, and the Demogorgon strikes.</span>
          </p>
        </div>

        {/* Instructions grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Health */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Heart className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">HEALTH SYSTEM</h3>
              <p className="font-vt323 text-gray-400">
                You start with 3 hearts. Wrong answers or timeouts summon the Demogorgon, costing you 1 heart.
                Game ends at 0 health.
              </p>
            </div>
          </div>

          {/* Portals */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Target className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-red-400 mb-2">PORTALS</h3>
              <p className="font-vt323 text-gray-400">
                Red glowing portals appear in your path. Colliding with them triggers a coding challenge.
                Stabilize them with correct answers!
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Clock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">TIME LIMITS</h3>
              <p className="font-vt323 text-gray-400">
                <span className="text-green-400">EASY: 10s</span> • 
                <span className="text-orange-400"> MEDIUM: 20s</span> • 
                <span className="text-red-400"> HARD: 30s</span>
                <br />
                Global time limit: 90 minutes
              </p>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-yellow-400 mb-2">SCORING</h3>
              <p className="font-vt323 text-gray-400">
                Correct: +100 pts | Fast solve: +50 bonus
                <br />
                Wrong: -50 pts | Timeout: -75 pts
                <br />
                Distance: +1 pt/second survived
              </p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-orange-400 mb-2">DIFFICULTY SCALING</h3>
              <p className="font-vt323 text-gray-400">
                Portals 0-3: EASY
                <br />
                Portals 4-6: MEDIUM
                <br />
                Portals 7+: HARD
              </p>
            </div>
          </div>

          {/* Power-ups */}
          <div className="bg-black/80 border border-red-900/50 p-5 flex items-start gap-4">
            <Gift className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-vt323 text-xl text-purple-400 mb-2">POWER-UPS</h3>
              <p className="font-vt323 text-gray-400">
                Random drops on correct answers:
                <br />
                🔷 Hawkins Stabilizer: Speed ×0.5
                <br />
                💚 Lab Med-Kit: +1 Health
                <br />
                ⚡ Signal Booster: 2× Score
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

        {/* Start button */}
        <div className="text-center">
          <Button
            data-testid="start-game-btn"
            onClick={handleStart}
            className="game-button text-2xl px-12 py-4 animate-pulse-glow"
          >
            <Play className="inline w-6 h-6 mr-3" />
            RUN
          </Button>
          
          <p className="mt-4 font-code text-xs text-red-600/60">
            PRESS TO INITIATE DIMENSIONAL ESCAPE SEQUENCE
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;
