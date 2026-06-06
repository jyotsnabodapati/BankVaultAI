export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  subject: 'Quantitative Aptitude' | 'Reasoning Ability' | 'English Language' | 'General Awareness';
  explanation?: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [key: string]: number };
  timeRemaining: number; // in seconds
  isSubmitted: boolean;
  score: number;
}

export interface EssaySubmission {
  topic: string;
  essayText: string;
  wordCount: number;
  grammarScore: number; // 0-10
  structureScore: number; // 0-10
  contentScore: number; // 0-10
  overallScore: number; // 0-100
  detailedReview: string; // Markdown review
  docId?: string; // Google Doc ID
  docUrl?: string; // Google Doc URL
  outOfScope?: boolean;
  outOfScopeWarning?: string;
}

export interface NewsQuiz {
  topic: string;
  searchQuery: string;
  questions: Question[];
}

export interface WeakTopic {
  subject: string;
  score: number; // percentage
  testType: 'Mock Test' | 'GA Quiz' | 'Essay Grade';
  remedialTips: string;
}

export interface CalendarEvent {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}

export interface MockHistoryItem {
  id: string;
  label: string;
  score: number;
  date: string;
}

export interface GradeEssayResponse {
  evaluation: {
    wordCount: number;
    grammarScore: number;
    structureScore: number;
    contentScore: number;
    overallScore: number;
    detailedReview: string;
  };
  googleDoc: {
    docId?: string;
    docUrl?: string;
    error?: string;
  } | null;
}
