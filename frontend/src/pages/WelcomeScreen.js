import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Lock, User, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import API_URL from '../config';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPassword2, setRegisterPassword2] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('🔐 Login response received for:', data.user.username);
      console.log('📦 Clearing old session data...');
      
      localStorage.removeItem('gameStatus');
      localStorage.removeItem('health');
      localStorage.removeItem('score');
      localStorage.removeItem('portalsCleared');
      localStorage.removeItem('timeSurvived');
      sessionStorage.clear();

      console.log('✅ Old session cleared. Storing new user:', data.user.username);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userEmail', data.user.email);
      
      sessionStorage.setItem('playerId', data.user.username);
      sessionStorage.setItem('playerPassword', password);

      console.log('💾 New user data stored:', {
        username: localStorage.getItem('username'),
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token') ? 'SET' : 'NOT SET'
      });

      console.log('✅ Login successful for:', data.user.username);
      navigate('/instructions');
    } catch (err) {
      setError('Network error: Could not connect to server');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerPassword2.trim()) {
      setError('All fields are required');
      return;
    }

    if (registerPassword !== registerPassword2) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      localStorage.removeItem('gameStatus');
      localStorage.removeItem('health');
      localStorage.removeItem('score');
      localStorage.removeItem('portalsCleared');
      localStorage.removeItem('timeSurvived');
      sessionStorage.clear();

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userEmail', data.user.email);
      
      sessionStorage.setItem('playerId', data.user.username);
      sessionStorage.setItem('playerPassword', registerPassword);

      console.log('✅ Registration successful for:', data.user.username);
      navigate('/instructions');
    } catch (err) {
      setError('Network error: Could not connect to server');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      data-testid="welcome-screen"
      className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
      
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

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <p className="font-vt323 text-lg text-gray-400 tracking-widest uppercase mb-2">
            IE CODE PRESENTS
          </p>
          <Ghost className="w-16 h-16 mx-auto text-red-500 mb-4 animate-float" />
          <h1 className="font-horror text-5xl sm:text-6xl text-red-500 text-glow-red tracking-wider mb-2">
            CICADA 1374
          </h1>
        </div>

        <div className="bg-black/80 border-2 border-red-900 p-8 box-glow-red relative">
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

          <div className="flex gap-2 mb-6 border-b border-red-900">
            <button
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`flex-1 py-2 font-vt323 text-sm transition-colors ${
                !isRegister
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`flex-1 py-2 font-vt323 text-sm transition-colors ${
                isRegister
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              REGISTER
            </button>
          </div>

          {!isRegister && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="game-input pl-12"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="game-input pl-12"
                />
              </div>

              {error && (
                <p data-testid="login-error" className="text-red-400 font-vt323 text-center text-sm">
                  {error}
                </p>
              )}

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
          )}

          {isRegister && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="game-input pl-12"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="game-input pl-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create password (6+ chars)"
                  className="game-input pl-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <input
                  type="password"
                  value={registerPassword2}
                  onChange={(e) => setRegisterPassword2(e.target.value)}
                  placeholder="Confirm password"
                  className="game-input pl-12"
                />
              </div>

              {error && (
                <p data-testid="login-error" className="text-red-400 font-vt323 text-center text-sm">
                  {error}
                </p>
              )}

              <Button
                data-testid="enter-btn"
                type="submit"
                disabled={isLoading}
                className="w-full game-button animate-pulse-glow"
              >
                {isLoading ? (
                  <span className="animate-flicker">ACCESSING...</span>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center font-code text-xs text-red-600/60">
            WARNING: DIMENSIONAL INSTABILITY DETECTED
          </p>
        </div>

        <p className="mt-8 text-center font-vt323 text-gray-600 text-sm">
          IE CODE CICADA 1374 ⚡ TECHNICAL EVENT 2026
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
