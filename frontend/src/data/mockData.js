// Mock Questions Database
export const mockQuestions = {
  EASY: [
   {
    id: 'e1',
      questionText: 'You are sprinting through the Upside Down, but a bio-organic gate blocks your path. The gate is calculating the "Neural Potential" of your surroundings using the sensor code below.Refer to the document linked to find the correct formula to bypass the gate.',
      correctAnswer: 'IE{0}',
      link: 'https://docs.google.com/document/d/18o4khjbWLI67a3Ns0Pj3GR5xLiNOZeuy/edit',
      difficulty: 'EASY',
    },
    {
      id: 'e2',
      questionText: ' "The lights blink in pairs. Each pair is a single letter, translated from the old code used in the arcade.',
      correctAnswer: 'IE{HAWKINS}',
      link: 'https://docs.google.com/document/d/1ZeyzQQV4iAXYPoxVhePWEW7lHZAYiQjpmWJjHfnPe5A/edit?tab=t.0',
      difficulty: 'EASY', 
    },
    {
      id: 'e3',
      questionText: 'A distorted signal leaks from the Upside Down—zeros and ones scream for help, but the truth hides beyond the bits',
      correctAnswer: 'IE{UpsideDown}',
      link:'https://drive.google.com/drive/folders/1dmdQDsVVq7MEkyx3mFff_rr5WPjdH6aj?usp=drive_link',
      difficulty: 'EASY',
    },
    {
      id: 'e4',
      questionText: 'After a surge of Upside Down activity, Eleven intercepts a corrupted sensor archive. With Vecna hiding in the noise, only careful analysis can reveal the truth.',
      correctAnswer: 'IE{6}',
      link:'https://drive.google.com/drive/folders/1GHE5u7nc4hFPkL-tS4LPjyZHMLHl8amp',
      difficulty: 'EASY',
    },
    {
      id: 'e5',
      questionText: 'The Upside Down is leaking into this page.The flag is hidden in plain sight-if you know where to look.',
      correctAnswer: 'IE{vecna_was_here}',
      link:'https://ctf-fake-flag.vercel.app/',
      difficulty: 'EASY',
    },
    {
      id: 'e6',
      questionText: 'Hawkins Lab collects real-time sensor readings to monitor disturbances across the town.Something in the Upside Down is responding to these signals.Study the attached document carefully and determine the correct outcome before it is too late.',
      correctAnswer: 'IE{anamoly_detection}',
      link:'https://drive.google.com/drive/folders/1P89i4PnFkhSsnLmKpEB834kU5U8piNwk',
      difficulty: 'EASY',
    },
    {
      id: 'e7',
      questionText: 'After a surge from the Upside Down, Hawkins Lab began recording abnormal energy readings.Individually, the signals look ordinary—but when combined, some sequences vanish entirely.Your task is to uncover how many such Invisible Signals exist.',
      correctAnswer: 'IE{145}',
      link:'https://docs.google.com/document/d/1XpjCuRNMbzbllwy4Cc0w5jHs1BZqRm3sd6E23fE5edQ/edit?usp=sharing',
      difficulty: 'EASY',
    },
    {
      id: 'e8',
      questionText: 'Hawkins Lab has detected temporal fluctuations in Eggo waffle prices due to cross-dimensional leakage from the Upside Down.',
      correctAnswer: 'IE{12}',
      link:'https://docs.google.com/document/d/1rD6l35zdJMbZeO_u_9Xam--BZp-bfvD7/edit?usp=sharing&ouid=113208483442949648799&rtpof=true&sd=true',
      difficulty: 'EASY',
    },
  ],
  MEDIUM: [
    {
      id: 'm1',
      questionText: 'Static fills the monitors as the demogorgon adapts to new signals.Hawkins Lab believes the system can be understood—if scaled correctly.The truth lies beyond the attached link.',
      correctAnswer: 'IE{mind_flayer_detected}',
      link: 'https://ctf-image-challenge.vercel.app/',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm2',
      questionText: 'After a power spike from the Upside Down, Hawkins Lab lost part of its security key.Two components can be reconstructed from sensor data.The final piece exists outside computation and must be deduced.',
      correctAnswer: 'IE{242731}',
      link: 'https://drive.google.com/drive/folders/1xvNc-iHZFCpjJgyQKpMmcw03rlHqjN4I?usp=drive_link',
      difficulty: 'MEDIUM',
    },
    {
      id: 'm3',
      questionText: 'Deep beneath Hawkins, a corrupted image has surfaced from a sealed terminal.At first glance it appears ordinary, but the lab knows better — the truth isn’t meant to be seen, only extracted.The message was hidden using techniques beyond normal perception.Those who understand how to listen between pixels may uncover what the Upside Down tried to bury.',
      correctAnswer: 'IE{ROT13: Shaqre_Mbar_77}',
      link: 'https://drive.google.com/drive/folders/1VIHY0773wSMEw3blyvXfioGsCnY3IPog',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm4',
      questionText: 'IThe Upside Down has spoken. Decode the signal from the Void. Use the linked document to find the hidden message.',
      correctAnswer: 'having',
      link: 'https://drive.google.com/drive/folders/1Tv7VvjzWEAYgjk668WdoVWYWvRODNc1_',
      difficulty: 'MEDIUM',
    },
    {
      id: 'm5',
      questionText: 'What is the output?\n\nprint(len(set([1,1,2,2,3])))',
      correctAnswer: '3',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm6',
      questionText: 'What HTTP status code means "Not Found"?',
      correctAnswer: '404',
      difficulty: 'MEDIUM',
    },
  ],
  HARD: [
    {
      id: 'h1',
      questionText: 'The Upside Down mirrors our world — but twists what it touches.This message was pulled from a collapsing gate, its symbols scrambled by the crossing.Understand what it remembers.Speak the name it asks for — and the path forward will open.',
      correctAnswer: 'IE{Comanechi}',
      link: 'https://drive.google.com/drive/folders/1Cx1wEpBCLv6YF1JdrHogwGBO6Qcdoc82',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h2',
       questionText: 'Hawkins Lab has intercepted a fragmented transmission from the Upside Down.The data appears encoded, but patterns emerge when analyzed correctly.Refer to the linked document to decode the message and reveal the hidden truth.',
     link: 'https://drive.google.com/drive/folders/1x-DXe-_M4IbHPxTb7_CIB_I8225A3FVh?usp=sharing',
      correctAnswer: 'IE{Dr_K@y_iS_De@d}',
      difficulty: 'HARD',
    },
    {
      id: 'h3',
      questionText: 'The Mind Flayer has breached the firewall, fracturing the escape code into a trinity of shadows.Recover the lost fragment by analyzing the corrupted data in the attached link.',
      correctAnswer: 'IE{DEMOLOSES}',
      link: 'https://drive.google.com/drive/folders/1OXnk08JalF_W0n7_4njl-hplPlmMJ920?usp=drive_link',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h4',
      questionText: 'It’s midnight in Hawkins. The portal to the Upside Down flickers violently, sending unstable energy waves through the town.Eleven wants to measure how well the model detects Fluctuating portals. Using the data in the linked document, help her find the correct measurement value to stabilize the portal.',
      correctAnswer: 'IE{20}',
      link:'https://docs.google.com/document/d/1KkPxWxIJE1ccslAUdqK0yuzkNld2VatJsBCDatg7l5U/edit?usp=sharing',
      difficulty: 'HARD',
    },
    {
      id: 'h5',
      questionText: 'What is the output?\n\nprint(bool([] == False))',
      correctAnswer: 'false',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h6',
      questionText: 'What pattern does the Observer pattern implement? (one word)',
      correctAnswer: 'publish-subscribe',
      difficulty: 'HARD',
    },
    {
      id: 'h7',
      questionText: 'Result of:\n\nconsole.log(0.1 + 0.2 === 0.3)',
      correctAnswer: 'false',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h8',
      questionText: 'What algorithm is used by JavaScript\'s Array.sort() internally? (one word)',
      correctAnswer: 'timsort',
      difficulty: 'HARD',
    },
  ],
};
// Import SecureStorage for encrypted localStorage
import SecureStorage from '../utils/secureStorage';

// Track used questions per session (also persisted per user in encrypted localStorage)
let usedQuestions = new Set();

// Get user-specific key for answered questions
const getAnsweredQuestionsKey = (username) => {
  return `answeredQuestions_${username}`;
};

// Load answered questions from encrypted localStorage for current user
export const loadAnsweredQuestions = () => {
  const username = localStorage.getItem('username');
  if (!username) return;
  
  const key = getAnsweredQuestionsKey(username);
  const answeredIds = SecureStorage.getItem(key, username);
  if (answeredIds && Array.isArray(answeredIds)) {
    usedQuestions = new Set(answeredIds);
  } else {
    usedQuestions = new Set();
  }
};

// Save answered questions to encrypted localStorage for current user
const saveAnsweredQuestions = () => {
  const username = localStorage.getItem('username');
  if (!username) return;
  
  const key = getAnsweredQuestionsKey(username);
  SecureStorage.setItem(key, [...usedQuestions], username);
};

// Reset used questions (call at game start for fresh start, or when user wants to replay all)
export const resetUsedQuestions = () => {
  // Don't reset - we want to keep track of answered questions across sessions
  // Only call this if you want a completely fresh start
};

// Force reset all answered questions for current user
export const forceResetAllQuestions = () => {
  const username = localStorage.getItem('username');
  if (username) {
    const key = getAnsweredQuestionsKey(username);
    SecureStorage.removeItem(key);
  }
  usedQuestions = new Set();
};

// Get a random unused question based on difficulty
// NOTE: Question is NOT marked as used here - call markQuestionAsUsed() after completion
export const getRandomQuestion = (difficulty) => {
  const questions = mockQuestions[difficulty] || mockQuestions.EASY;
  const availableQuestions = questions.filter(q => !usedQuestions.has(q.id));
  
  if (availableQuestions.length === 0) {
    // All questions in this difficulty have been answered
    // Move to a random question from this difficulty (allow repeat)
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  // Don't mark as used here - wait until question is actually completed
  return question;
};

// Mark a question as used (call after question is completed - correct answer, timeout, or save me)
export const markQuestionAsUsed = (questionId) => {
  if (!questionId) return;
  usedQuestions.add(questionId);
  saveAnsweredQuestions(); // Persist to localStorage
};

// Mock Leaderboard Data
export const mockLeaderboard = [
  { rank: 1, name: 'DemoHunter', rollNo: 'CS2021001', score: 2850, portalsCleared: 25, timeSurvived: 1847 },
  { rank: 2, name: 'ElevenFan', rollNo: 'CS2021042', score: 2720, portalsCleared: 23, timeSurvived: 1692 },
  { rank: 3, name: 'MindFlayer', rollNo: 'IT2020015', score: 2580, portalsCleared: 22, timeSurvived: 1580 },
  { rank: 4, name: 'HawkinsHero', rollNo: 'CS2022033', score: 2450, portalsCleared: 21, timeSurvived: 1523 },
  { rank: 5, name: 'UpsideRunner', rollNo: 'EC2021008', score: 2320, portalsCleared: 20, timeSurvived: 1467 },
  { rank: 6, name: 'StrangerCoder', rollNo: 'CS2020099', score: 2180, portalsCleared: 19, timeSurvived: 1401 },
  { rank: 7, name: 'PortalMaster', rollNo: 'IT2021056', score: 2050, portalsCleared: 18, timeSurvived: 1345 },
  { rank: 8, name: 'CodeBreaker', rollNo: 'CS2022011', score: 1920, portalsCleared: 17, timeSurvived: 1289 },
  { rank: 9, name: 'ByteRunner', rollNo: 'EC2020067', score: 1780, portalsCleared: 16, timeSurvived: 1234 },
  { rank: 10, name: 'SyntaxHero', rollNo: 'CS2021078', score: 1650, portalsCleared: 15, timeSurvived: 1178 },
  { rank: 11, name: 'LoopMaster', rollNo: 'IT2022034', score: 1520, portalsCleared: 14, timeSurvived: 1122 },
  { rank: 12, name: 'ArrayKnight', rollNo: 'CS2020045', score: 1380, portalsCleared: 13, timeSurvived: 1067 },
  { rank: 13, name: 'RecursiveRun', rollNo: 'EC2021089', score: 1250, portalsCleared: 12, timeSurvived: 1011 },
  { rank: 14, name: 'StackOverflow', rollNo: 'IT2020012', score: 1120, portalsCleared: 11, timeSurvived: 955 },
  { rank: 15, name: 'HeapHero', rollNo: 'CS2022067', score: 980, portalsCleared: 10, timeSurvived: 899 },
];

// Add player score to leaderboard (mock)
export const addToLeaderboard = (playerData) => {
  const newEntry = {
    ...playerData,
    rank: 0,
  };
  
  // Create new leaderboard with player entry
  const updatedLeaderboard = [...mockLeaderboard, newEntry];
  
  // Sort by score (desc), then portals (desc), then time (asc)
  updatedLeaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.portalsCleared !== a.portalsCleared) return b.portalsCleared - a.portalsCleared;
    return a.timeSurvived - b.timeSurvived;
  });
  
  // Assign ranks
  updatedLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return updatedLeaderboard;
};

// Format time as MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format time as HH:MM:SS for longer durations
export const formatLongTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};