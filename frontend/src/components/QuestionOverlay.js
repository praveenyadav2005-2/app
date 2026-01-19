import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal, Clock, AlertTriangle, Heart, XCircle, ExternalLink } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DIFFICULTY } from '../gameConfig';
import { Button } from './ui/button';

const QuestionOverlay = () => {
  const { 
    currentQuestion, 
    showQuestionOverlay, 
    submitAnswer, 
    useSaveMe,
    handleTimeout,
    difficulty,
    health,
    questionTimeRemaining,
    setQuestionTimeRemaining
  } = useGame();
  
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wrongAnswerFeedback, setWrongAnswerFeedback] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const questionIdRef = useRef(null); // Track which question we're showing
  const timerInitializedRef = useRef(false); // Track if timer has been initialized for current question

  // Get the full difficulty object and its timeLimit
  const difficultyObj = typeof difficulty === 'string' 
    ? Object.values(DIFFICULTY).find(d => d.name === difficulty) 
    : difficulty;
  const questionTimeLimit = currentQuestion?.timeLimit || difficultyObj?.timeLimit || 1200;

  // Reset state when new question appears (but not for same question on resume)
  useEffect(() => {
    if (showQuestionOverlay && currentQuestion) {
      // Check if this is a new question or resuming the same one
      const isNewQuestion = currentQuestion.id !== questionIdRef.current;
      
      if (isNewQuestion || !timerInitializedRef.current) {
        // New question or first time initializing this question after refresh
        setAnswer('');
        setIsSubmitting(false);
        setWrongAnswerFeedback(false);
        setAttemptsCount(0);
        questionIdRef.current = currentQuestion.id;
        
        // Use restored time if available, otherwise use full time limit
        if (questionTimeRemaining != null && questionTimeRemaining > 0) {
          setTimeRemaining(Math.floor(questionTimeRemaining));
        } else {
          setTimeRemaining(questionTimeLimit);
        }
        timerInitializedRef.current = true;
      }
    } else {
      // Reset when question overlay is closed
      timerInitializedRef.current = false;
    }
  }, [showQuestionOverlay, currentQuestion, questionTimeLimit, questionTimeRemaining]);

  // Sync time remaining back to context for saving
  useEffect(() => {
    if (showQuestionOverlay && timeRemaining > 0) {
      setQuestionTimeRemaining(timeRemaining);
    }
  }, [timeRemaining, showQuestionOverlay, setQuestionTimeRemaining]);

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
    const result = submitAnswer(answer, timeRemaining, questionTimeLimit);
    
    if (result.allowRetry) {
      // Wrong answer - show feedback but allow retry
      setWrongAnswerFeedback(true);
      setAttemptsCount(prev => prev + 1);
      setAnswer('');
      setIsSubmitting(false);
      
      // Hide wrong answer feedback after 2 seconds
      setTimeout(() => {
        setWrongAnswerFeedback(false);
      }, 2000);
    }
    // If correct, the overlay will close automatically via GameContext
  }, [answer, isSubmitting, submitAnswer, timeRemaining, questionTimeLimit]);

  const onSaveMe = useCallback(() => {
    if (health <= 0) return;
    useSaveMe();
  }, [health, useSaveMe]);

  if (!showQuestionOverlay || !currentQuestion) return null;

  const timePercentage = (timeRemaining / questionTimeLimit) * 100;
  const isLowTime = timeRemaining <= 60; // Low time when <= 1 minute
  
  // Convert timeRemaining to minutes format
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div 
      data-testid="question-overlay"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-3xl mx-2 sm:mx-4 my-auto bg-gradient-to-b from-black to-red-950/20 border-2 border-red-600/80 box-glow-red relative overflow-hidden rounded-lg shadow-2xl">
        {/* Top bar - enhanced */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-red-900/60 bg-gradient-to-r from-red-950/30 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 drop-shadow-lg" />
            <span className="font-code text-red-300 tracking-widest uppercase text-xs sm:text-sm font-bold">
              CIPHER CHALLENGE
            </span>
          </div>
          <span className="font-code text-[10px] sm:text-xs text-red-500/80 opacity-70 hidden sm:inline">
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
        <div className="p-4 sm:p-10">
          {/* Timer display - centered and bold */}
          <div data-testid="question-timer" className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Clock className={`w-6 h-6 sm:w-8 sm:h-8 ${isLowTime ? 'text-red-500 animate-pulse drop-shadow-lg' : 'text-white'}`} />
            <span className={`font-code text-3xl sm:text-5xl font-bold tracking-wider ${
              isLowTime ? 'text-red-500 animate-flicker drop-shadow-lg' : 'text-white'
            }`}>
              {timeDisplay}
            </span>
          </div>

          {/* Warning for low time */}
          {isLowTime && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 bg-red-950/40 border border-red-600/60 rounded text-red-300 animate-pulse">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-code text-sm sm:text-base uppercase tracking-widest font-bold">
                Portal Instability Critical!
              </span>
            </div>
          )}

          {/* Question section */}
          <div className="mb-6 sm:mb-10 p-4 sm:p-6 bg-black/50 border border-red-900/40 rounded">
            <p className="font-code text-red-400 text-xs sm:text-sm mb-3 sm:mb-4 opacity-80 uppercase tracking-widest">
              {currentQuestion.difficulty} CIPHER LEVEL
            </p>
            
            {currentQuestion.hasCode ? (
              <div className="space-y-4 sm:space-y-5">
                <p className="font-code text-sm sm:text-lg text-gray-100 leading-relaxed">
                  {currentQuestion.questionText.split('\n')[0]}
                </p>
                <pre className="code-block bg-black/80 border border-white/40 p-3 sm:p-4 rounded overflow-x-auto text-sm sm:text-base">
                  <code className="text-white">{currentQuestion.questionText.split('\n').slice(1).join('\n')}</code>
                </pre>
              </div>
            ) : (
              <p data-testid="question-text" className="font-code text-sm sm:text-lg text-gray-100 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            )}

            {/* Document Link */}
            {currentQuestion.link && (
              <a
                href={currentQuestion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 sm:mt-5 px-3 sm:px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-600/60 hover:border-red-500 rounded text-red-300 hover:text-red-200 font-code text-xs sm:text-sm transition-all duration-200 group"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-wider">Open Document</span>
              </a>
            )}
          </div>

          {/* Wrong Answer Feedback */}
          {wrongAnswerFeedback && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 bg-red-900/60 border border-red-500 rounded animate-shake">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
              <span className="font-code text-sm sm:text-base text-red-300 uppercase tracking-wider font-bold">
                Wrong! Try Again ({attemptsCount})
              </span>
            </div>
          )}

          {/* Answer form */}
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="relative group">
              <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-white font-code text-xl sm:text-2xl group-focus-within:text-red-500">
                {'>'}
              </span>
              <input
                data-testid="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className={`w-full px-10 sm:px-16 py-3 sm:py-4 bg-black border-2 ${wrongAnswerFeedback ? 'border-red-500 animate-pulse' : 'border-white/50'} focus:border-white text-white font-code text-base sm:text-lg placeholder-gray-600 outline-none transition-all rounded focus:shadow-lg focus:shadow-white/20`}
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* Submit and Save Me buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                data-testid="submit-answer-btn"
                type="submit"
                disabled={!answer.trim() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 text-white font-code text-base sm:text-lg py-3 sm:py-4 rounded font-bold uppercase tracking-wider transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-red-500/50"
              >
                {isSubmitting ? (
                  <span className="animate-flicker">TRANSMITTING...</span>
                ) : (
                  'SUBMIT ANSWER'
                )}
              </Button>
              
              <Button
                data-testid="save-me-btn"
                type="button"
                onClick={onSaveMe}
                disabled={health <= 0 || isSubmitting}
                className="flex-shrink-0 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 text-white font-code text-base sm:text-lg py-3 sm:py-4 px-4 sm:px-6 rounded font-bold uppercase tracking-wider transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 border border-red-500/50"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">SAVE ME</span>
                <span className="sm:hidden">SKIP</span>
                <span className="text-xs sm:text-sm opacity-80">({health})</span>
              </Button>
            </div>
          </form>

          {/* Hint */}
          <p className="mt-4 sm:mt-6 text-center text-gray-500 text-xs sm:text-sm font-code">
            Case-insensitive. Keep trying or use "Save Me" to skip (costs 1 life).
          </p>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-red-600/60" />
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-red-600/60" />
      </div>
    </div>
  );
};

export default QuestionOverlay;
