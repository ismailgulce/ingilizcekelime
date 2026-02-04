'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/evaluate-fill-in-the-blank.ts';
import '@/ai/flows/generate-word-details.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/generate-new-words-and-quiz.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-quiz-from-words.ts';
