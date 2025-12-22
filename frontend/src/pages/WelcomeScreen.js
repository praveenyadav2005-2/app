import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/button';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!playerId.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    setIsLoading(true);
    
    // Mock validation - any input is accepted
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store credentials in sessionStorage for the game
    sessionStorage.setItem('playerId', playerId);
    sessionStorage.setItem('playerPassword', password);
    
    setIsLoading(false);
    navigate('/instructions');
  };

  return (
    <div 
      data-testid="welcome-screen"
      className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <Ghost className="w-16 h-16 mx-auto text-red-500 mb-4 animate-float" />
          <h1 className="font-horror text-5xl sm:text-6xl text-red-500 text-glow-red tracking-wider mb-2">
            CODE ENIGMA
          </h1>
          <p className="font-vt323 text-xl text-gray-400 tracking-widest uppercase">
            Round 1 // Escape the Upside Down
          </p>
        </div>

        {/* Login form */}
        <div className="bg-black/80 border-2 border-red-900 p-8 box-glow-red relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600" />

          <div className="text-center mb-6">
            <span className="font-code text-xs text-red-600 tracking-wider">
              HAWKINS NATIONAL LABORATORY
            </span>
            <h2 className="font-vt323 text-2xl text-gray-300 mt-2">
              IDENTIFICATION REQUIRED
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player ID */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
              <input
                data-testid="player-id-input"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Enter your ID"
                className="game-input pl-12"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
              <input
                data-testid="player-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="game-input pl-12"
              />
            </div>

            {/* Error message */}
            {error && (
              <p data-testid="login-error" className="text-red-400 font-vt323 text-center">
                {error}
              </p>
            )}

            {/* Submit button */}
            <Button
              data-testid="enter-btn"
              type="submit"
              disabled={isLoading}
              className="w-full game-button animate-pulse-glow"
            >
              {isLoading ? (
                <span className="animate-flicker">ACCESSING...</span>
              ) : (
                'ENTER THE UPSIDE DOWN'
              )}
            </Button>
          </form>

          {/* Warning */}
          <p className="mt-6 text-center font-code text-xs text-red-600/60">
            WARNING: DIMENSIONAL INSTABILITY DETECTED
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center font-vt323 text-gray-600 text-sm">
          IE CODE ENIGMA // TECHNICAL EVENT 2024
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
