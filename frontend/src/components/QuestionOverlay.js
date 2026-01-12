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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl mx-4 bg-gradient-to-b from-black to-red-950/20 border-2 border-red-600/80 box-glow-red relative overflow-hidden rounded-lg shadow-2xl">
        {/* Top bar - enhanced */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-red-900/60 bg-gradient-to-r from-red-950/30 to-transparent">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-red-500 drop-shadow-lg" />
            <span className="font-code text-red-300 tracking-widest uppercase text-sm font-bold">
              CIPHER CHALLENGE
            </span>
          </div>
          <span className="font-code text-xs text-red-500/80 opacity-70">
            PORTAL LOCK PROTOCOL
          </span>
        </div>

        {/* Timer bar - improved */}
        <div className="h-3 bg-gradient-to-r from-red-950/50 to-transparent overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 bg-gradient-to-r ${
              isLowTime ? 'from-red-500 to-red-600 animate-pulse shadow-lg shadow-red-500' : 'from-red-600 to-red-700'
            }`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-10">
          {/* Timer display - centered and bold */}
          <div data-testid="question-timer" className="flex items-center justify-center gap-4 mb-8">
            <Clock className={`w-8 h-8 ${isLowTime ? 'text-red-500 animate-pulse drop-shadow-lg' : 'text-cyan-400'}`} />
            <span className={`font-code text-5xl font-bold tracking-wider ${
              isLowTime ? 'text-red-500 animate-flicker drop-shadow-lg' : 'text-cyan-300'
            }`}>
              {timeRemaining}s
            </span>
          </div>

          {/* Warning for low time */}
          {isLowTime && (
            <div className="flex items-center justify-center gap-3 mb-6 px-4 py-3 bg-red-950/40 border border-red-600/60 rounded text-red-300 animate-pulse">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <span className="font-code text-base uppercase tracking-widest font-bold">
                Portal Instability Critical!
              </span>
            </div>
          )}

          {/* Question section */}
          <div className="mb-10 p-6 bg-black/50 border border-red-900/40 rounded">
            <p className="font-code text-red-400 text-sm mb-4 opacity-80 uppercase tracking-widest">
              {currentQuestion.difficulty} CIPHER LEVEL
            </p>
            
            {currentQuestion.hasCode ? (
              <div className="space-y-5">
                <p className="font-code text-lg text-gray-100 leading-relaxed">
                  {currentQuestion.questionText.split('\n')[0]}
                </p>
                <pre className="code-block bg-black/80 border border-cyan-900/40 p-4 rounded overflow-x-auto">
                  <code className="text-cyan-300">{currentQuestion.questionText.split('\n').slice(1).join('\n')}</code>
                </pre>
              </div>
            ) : (
              <p data-testid="question-text" className="font-code text-lg text-gray-100 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            )}
          </div>

          {/* Answer form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500 font-code text-2xl group-focus-within:text-red-500">
                {'>'}
              </span>
              <input
                data-testid="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-16 py-4 bg-black border-2 border-cyan-600/50 focus:border-cyan-500 text-cyan-300 font-code text-lg placeholder-gray-600 outline-none transition-all rounded focus:shadow-lg focus:shadow-cyan-500/20"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <Button
              data-testid="submit-answer-btn"
              type="submit"
              disabled={!answer.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 text-white font-code text-lg py-4 rounded font-bold uppercase tracking-wider transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-red-500/50"
            >
              {isSubmitting ? (
                <span className="animate-flicker">TRANSMITTING...</span>
              ) : (
                'STABILIZE PORTAL'
              )}
            </Button>
          </form>

          {/* Hint */}
          <p className="mt-6 text-center text-gray-500 text-sm font-code">
            Answer is case-insensitive. Exact spelling required.
          </p>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-600/60" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-600/60" />
      </div>
    </div>
  );
};

export default QuestionOverlay;
