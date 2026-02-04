import type { GenerateWordDetailsOutput } from '@/ai/flows/generate-word-details';
import type { QuizQuestion as AIQuizQuestion } from '@/ai/flows/generate-new-words-and-quiz';

export interface Word extends GenerateWordDetailsOutput {
  id: string; // Document ID from Firestore
  userId: string;
  word: string;
  srsLevel: number;
  nextReview: string; // ISO date string
  lastCorrect: string | null; // ISO date string
  timesCorrect: number;
  timesIncorrect: number;
  addedDate: string; // ISO date string
}

export interface VocabularyState {
  words: Word[];
  dailyGoal: number;
}

export interface QuizQuestion extends AIQuizQuestion {}

export interface UserAnswer {
    questionIndex: number;
    answer: string;
    isCorrect: boolean;
}

export interface TextToSpeechOutput {
    media: string;
}
