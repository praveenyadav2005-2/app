import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import CRTOverlay from './components/CRTOverlay';
import WelcomeScreen from './pages/WelcomeScreen';
import InstructionsScreen from './pages/InstructionsScreen';
import GameScreen from './pages/GameScreen';
import GameOverScreen from './pages/GameOverScreen';
import LeaderboardScreen from './pages/LeaderboardScreen';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="App min-h-screen bg-black">
        {/* CRT/Visual Effects Overlay */}
        <CRTOverlay />
        
        {/* Router */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/instructions" element={<InstructionsScreen />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/gameover" element={<GameOverScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </GameProvider>
  );
}

export default App;
