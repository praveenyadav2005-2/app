// Mock Questions Database
export const mockQuestions = {
  EASY: [
    {
      id: 'e1',
      questionText: 'What is the output of: 2 + 2 * 3',
      correctAnswer: '8',
      difficulty: 'EASY',
    },
    {
      id: 'e2',
      questionText: 'In Python, what keyword is used to define a function?',
      correctAnswer: 'def',
      difficulty: 'EASY',
    },
    {
      id: 'e3',
      questionText: 'What does HTML stand for? (just first letter of each word)',
      correctAnswer: 'html',
      difficulty: 'EASY',
    },
    {
      id: 'e4',
      questionText: 'What is 15 % 4? (modulo operation)',
      correctAnswer: '3',
      difficulty: 'EASY',
    },
    {
      id: 'e5',
      questionText: 'What symbol is used for single-line comments in JavaScript?',
      correctAnswer: '//',
      difficulty: 'EASY',
    },
    {
      id: 'e6',
      questionText: 'What is the boolean value of an empty string in Python?',
      correctAnswer: 'false',
      difficulty: 'EASY',
    },
    {
      id: 'e7',
      questionText: 'What method adds an element to the end of an array in JavaScript?',
      correctAnswer: 'push',
      difficulty: 'EASY',
    },
    {
      id: 'e8',
      questionText: 'What is 2^8? (2 to the power of 8)',
      correctAnswer: '256',
      difficulty: 'EASY',
    },
  ],
  MEDIUM: [
    {
      id: 'm1',
      questionText: 'What will be printed?\n\nfor i in range(3):\n    print(i, end="")',
      correctAnswer: '012',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm2',
      questionText: 'What is the time complexity of binary search?',
      correctAnswer: 'o(log n)',
      difficulty: 'MEDIUM',
    },
    {
      id: 'm3',
      questionText: 'What will this return?\n\n[1,2,3].map(x => x * 2).join("-")',
      correctAnswer: '2-4-6',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm4',
      questionText: 'In SQL, which clause is used to filter aggregated results?',
      correctAnswer: 'having',
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
    {
      id: 'm7',
      questionText: 'What is the result?\n\nconsole.log(typeof null)',
      correctAnswer: 'object',
      difficulty: 'MEDIUM',
      hasCode: true,
    },
    {
      id: 'm8',
      questionText: 'What data structure uses LIFO (Last In First Out)?',
      correctAnswer: 'stack',
      difficulty: 'MEDIUM',
    },
  ],
  HARD: [
    {
      id: 'h1',
      questionText: 'What is printed?\n\ndef f(a=[]):\n    a.append(1)\n    return len(a)\n\nprint(f(), f(), f())',
      correctAnswer: '1 2 3',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h2',
      questionText: 'What is the space complexity of merge sort?',
      correctAnswer: 'o(n)',
      difficulty: 'HARD',
    },
    {
      id: 'h3',
      questionText: 'What is output?\n\nconst a = [1,2,3];\nconst b = a;\nb.push(4);\nconsole.log(a.length)',
      correctAnswer: '4',
      difficulty: 'HARD',
      hasCode: true,
    },
    {
      id: 'h4',
      questionText: 'In Big-O, what is the complexity of finding an element in a balanced BST?',
      correctAnswer: 'o(log n)',
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

// Track used questions per session
let usedQuestions = new Set();

// Reset used questions (call at game start)
export const resetUsedQuestions = () => {
  usedQuestions = new Set();
};

// Get a random unused question based on difficulty
export const getRandomQuestion = (difficulty) => {
  const questions = mockQuestions[difficulty] || mockQuestions.EASY;
  const availableQuestions = questions.filter(q => !usedQuestions.has(q.id));
  
  if (availableQuestions.length === 0) {
    // Reset if all questions used
    questions.forEach(q => usedQuestions.delete(q.id));
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  usedQuestions.add(question.id);
  return question;
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
