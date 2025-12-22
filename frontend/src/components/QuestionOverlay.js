import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Clock, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';

const QuestionOverlay = () => {
  const { 
    currentQuestion, 
    showQuestionOverlay, 
    submitAnswer, 
    handleTimeout,
    difficulty
  } = useGame();
  
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionTimeLimit = currentQuestion?.timeLimit || difficulty.timeLimit;

  // Reset state when new question appears
  useEffect(() => {
    if (showQuestionOverlay && currentQuestion) {
      setAnswer('');
      setTimeRemaining(questionTimeLimit);
      setIsSubmitting(false);
    }
  }, [showQuestionOverlay, currentQuestion, questionTimeLimit]);

  // Countdown timer
  useEffect(() => {
    if (!showQuestionOverlay || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQuestionOverlay, timeRemaining, handleTimeout]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    if (isSubmitting || !answer.trim()) return;
    
    setIsSubmitting(true);
    submitAnswer(answer, timeRemaining, questionTimeLimit);
  }, [answer, isSubmitting, submitAnswer, timeRemaining, questionTimeLimit]);

  if (!showQuestionOverlay || !currentQuestion) return null;

  const timePercentage = (timeRemaining / questionTimeLimit) * 100;
  const isLowTime = timeRemaining <= 5;

  return (
    <div 
      data-testid="question-overlay"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl mx-4 bg-black border-2 border-red-600 box-glow-red relative overflow-hidden">
        {/* Top bar with stamps */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-red-900/50 bg-red-950/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-500" />
            <span className="font-vt323 text-red-400 tracking-widest uppercase text-sm">
              Corrupted Portal Detected
            </span>
          </div>
          <span className="font-code text-xs text-red-600 opacity-60">
            HAWKINS LAB // CLASSIFIED
          </span>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-red-950/30">
          <div 
            className={`h-full transition-all duration-1000 ${
              isLowTime ? 'bg-red-500 animate-pulse' : 'bg-red-600'
            }`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Timer display */}
          <div data-testid="question-timer" className="flex items-center justify-center gap-2 mb-6">
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <span className={`font-code text-4xl ${
              isLowTime ? 'text-red-500 animate-flicker' : 'text-gray-300'
            }`}>
              {timeRemaining}s
            </span>
          </div>

          {/* Warning for low time */}
          {isLowTime && (
            <div className="flex items-center justify-center gap-2 mb-4 text-red-400 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-vt323 text-lg uppercase tracking-wider">
                Demogorgon Approaching!
              </span>
            </div>
          )}

          {/* Question text */}
          <div className="mb-8">
            <p className="font-vt323 text-gray-300 text-lg mb-2 opacity-60">
              {currentQuestion.difficulty} LEVEL CIPHER
            </p>
            
            {currentQuestion.hasCode ? (
              <div className="space-y-4">
                <p className="font-vt323 text-xl text-gray-200">
                  {currentQuestion.questionText.split('\n')[0]}
                </p>
                <pre className="code-block">
                  {currentQuestion.questionText.split('\n').slice(1).join('\n')}
                </pre>
              </div>
            ) : (
              <p data-testid="question-text" className="font-vt323 text-xl text-gray-200 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            )}
          </div>

          {/* Answer form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 font-code text-xl">
                {'>'}
              </span>
              <input
                data-testid="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="game-input pl-10 text-xl"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <Button
              data-testid="submit-answer-btn"
              type="submit"
              disabled={!answer.trim() || isSubmitting}
              className="w-full game-button text-xl py-4"
            >
              {isSubmitting ? 'TRANSMITTING...' : 'STABILIZE PORTAL'}
            </Button>
          </form>

          {/* Hint */}
          <p className="mt-6 text-center text-gray-600 text-sm font-vt323">
            Type your answer exactly. Case insensitive.
          </p>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-600/50" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-600/50" />
      </div>
    </div>
  );
};

export default QuestionOverlay;
