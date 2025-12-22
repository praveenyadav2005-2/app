import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft, Crown, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGame } from '../context/GameContext';
import { mockLeaderboard, addToLeaderboard, formatLongTime } from '../data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';

const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const { playerId, score, portalsCleared, timeSurvived } = useGame();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [playerEntry, setPlayerEntry] = useState(null);

  useEffect(() => {
    // Add current player to leaderboard if they played
    if (playerId && score > 0) {
      const updatedLeaderboard = addToLeaderboard({
        name: playerId,
        rollNo: 'PLAYER',
        score,
        portalsCleared,
        timeSurvived,
      });
      setLeaderboardData(updatedLeaderboard);
      
      const entry = updatedLeaderboard.find(e => e.name === playerId);
      setPlayerEntry(entry);
    } else {
      setLeaderboardData(mockLeaderboard);
    }
  }, [playerId, score, portalsCleared, timeSurvived]);

  const handleBack = () => {
    navigate('/');
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="font-vt323 text-lg text-gray-500">{rank}</span>;
    }
  };

  const isTopTen = (rank) => rank <= 10;
  const isCurrentPlayer = (name) => name === playerId;

  return (
    <div 
      data-testid="leaderboard-screen"
      className="min-h-screen bg-black p-4 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black" />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Button
            data-testid="back-btn"
            onClick={handleBack}
            className="game-button px-4 py-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>

          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <h1 className="font-horror text-4xl text-red-500 text-glow-red tracking-wider">
              LEADERBOARD
            </h1>
            <p className="font-vt323 text-gray-500 text-sm mt-1">
              DIMENSIONAL ESCAPE RANKINGS
            </p>
          </div>

          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Player's current rank banner */}
        {playerEntry && (
          <div className="mb-6 p-4 bg-purple-950/30 border border-purple-600 box-glow-red">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="font-vt323 text-sm text-purple-300">YOUR RANK</p>
                  <p className="font-horror text-3xl text-purple-400">#{playerEntry.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-vt323 text-sm text-gray-400">SCORE</p>
                <p className="font-vt323 text-2xl text-yellow-400">{playerEntry.score.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="bg-black/80 border border-red-900/50 rounded-lg overflow-hidden">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-red-900/50 hover:bg-transparent">
                  <TableHead className="font-vt323 text-red-400 text-center w-20">RANK</TableHead>
                  <TableHead className="font-vt323 text-red-400">NAME</TableHead>
                  <TableHead className="font-vt323 text-red-400">ROLL NO</TableHead>
                  <TableHead className="font-vt323 text-red-400 text-right">SCORE</TableHead>
                  <TableHead className="font-vt323 text-red-400 text-center">PORTALS</TableHead>
                  <TableHead className="font-vt323 text-red-400 text-right">TIME</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry) => (
                  <TableRow 
                    key={`${entry.rank}-${entry.name}`}
                    data-testid={`leaderboard-row-${entry.rank}`}
                    className={`
                      border-b border-gray-900/50 transition-colors
                      ${isTopTen(entry.rank) ? 'leaderboard-top' : ''}
                      ${isCurrentPlayer(entry.name) ? 'bg-purple-950/30 border-purple-600' : 'hover:bg-red-950/20'}
                    `}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-vt323 text-lg ${
                        isCurrentPlayer(entry.name) ? 'text-purple-300' : 
                        isTopTen(entry.rank) ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {entry.name}
                        {isCurrentPlayer(entry.name) && (
                          <span className="ml-2 text-xs text-purple-400">(YOU)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-code text-sm text-gray-500">{entry.rollNo}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-vt323 text-lg ${
                        isTopTen(entry.rank) ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {entry.score.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-vt323 text-lg text-red-400">{entry.portalsCleared}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-code text-sm text-gray-500">
                        {formatLongTime(entry.timeSurvived)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex justify-between items-center text-gray-600 font-code text-xs">
          <span>SORTED BY: SCORE {'>'} PORTALS {'>'} TIME</span>
          <span>TOP 10 HIGHLIGHTED</span>
          <span>READ-ONLY MODE</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
