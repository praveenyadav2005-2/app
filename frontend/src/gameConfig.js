/**
 * Game Configuration File
 * 
 * This file contains all configurable game settings.
 * Modify these values to adjust game behavior without changing code logic.
 */

// ===========================================
// PLAYER SETTINGS
// ===========================================
export const PLAYER = {
  INITIAL_HEALTH: 5,
  MAX_HEALTH: 5,
  SCALE: 0.8,
  JUMP_VELOCITY: -450,
  GRAVITY: 300,
};

// ===========================================
// SPEED SETTINGS
// ===========================================
export const SPEED = {
  INITIAL: 200,
  INCREMENT: 20,
  INCREMENT_INTERVAL: 30000, // 30 seconds (ms)
};

// ===========================================
// TIME SETTINGS
// ===========================================
export const TIME = {
  GLOBAL_TIME_LIMIT: 2 * 60 * 60, // 2 hours in seconds
  QUESTION_TIME_EASY: 1200,       // 20 minutes for easy questions
  QUESTION_TIME_MEDIUM: 1800,     // 30 minutes for medium questions
  QUESTION_TIME_HARD: 2400,       // 40 minutes for hard questions
};

// ===========================================
// DIFFICULTY SETTINGS
// ===========================================
export const DIFFICULTY = {
  EASY: { 
    name: 'EASY', 
    timeLimit: TIME.QUESTION_TIME_EASY, 
    scoreBonus: 100 
  },
  MEDIUM: { 
    name: 'MEDIUM', 
    timeLimit: TIME.QUESTION_TIME_MEDIUM, 
    scoreBonus: 200 
  },
  HARD: { 
    name: 'HARD', 
    timeLimit: TIME.QUESTION_TIME_HARD, 
    scoreBonus: 300 
  },
};

// ===========================================
// DIFFICULTY PROGRESSION
// Number of questions visited (solved OR saved) for difficulty upgrade
// ===========================================
export const DIFFICULTY_PROGRESSION = {
  PORTALS_FOR_MEDIUM: 5,  // Visit 5 questions to move from EASY to MEDIUM
  PORTALS_FOR_HARD: 10,   // Visit 10 questions total to move from MEDIUM to HARD
  MAX_QUESTIONS: 15,      // Game ends after visiting 15 questions (5 easy + 5 medium + 5 hard)
};

// ===========================================
// SCORING
// ===========================================
export const SCORING = {
  CORRECT_ANSWER: 100,
  DEMOGORGON_PENALTY: 2,
};

// ===========================================
// SPAWN SETTINGS
// ===========================================
export const SPAWN = {
  PORTAL_INTERVAL: 8000,     // Portal spawn interval (ms)
  ENTITY_SPAWN_DELAY: 1500,  // Delay before spawning next entity (ms)
};

// ===========================================
// UI SETTINGS
// ===========================================
export const UI = {
  BOTTOM_FRAME_HEIGHT: 50,
  TOP_FRAME_HEIGHT: 60,
  GROUND_HEIGHT: 32,
};

// ===========================================
// LEGACY EXPORTS (for backward compatibility)
// These match the old export names from GameContext
// ===========================================
export const INITIAL_HEALTH = PLAYER.INITIAL_HEALTH;
export const MAX_HEALTH = PLAYER.MAX_HEALTH;
export const INITIAL_SPEED = SPEED.INITIAL;
export const SPEED_INCREMENT = SPEED.INCREMENT;
export const SPEED_INCREMENT_INTERVAL = SPEED.INCREMENT_INTERVAL;
export const PORTAL_SPAWN_INTERVAL = SPAWN.PORTAL_INTERVAL;
export const GLOBAL_TIME_LIMIT = TIME.GLOBAL_TIME_LIMIT;
