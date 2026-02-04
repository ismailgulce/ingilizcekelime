'use server';

import {
  generateWordDetails,
  GenerateWordDetailsInput,
  GenerateWordDetailsOutput,
} from '@/ai/flows/generate-word-details';
import {
  evaluateFillInTheBlank,
  EvaluateFillInTheBlankInput,
  EvaluateFillInTheBlankOutput,
} from '@/ai/flows/evaluate-fill-in-the-blank';
import {
  translateText,
  TranslateTextInput,
  TranslateTextOutput,
} from '@/ai/flows/translate-text';
import {
  generateNewWordsAndQuiz,
  GenerateNewWordsAndQuizInput,
  GenerateNewWordsAndQuizOutput,
} from '@/ai/flows/generate-new-words-and-quiz';
import {
  textToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from '@/ai/flows/text-to-speech';
import {
  generateQuizFromWords,
  GenerateQuizFromWordsInput,
  GenerateQuizFromWordsOutput,
} from '@/ai/flows/generate-quiz-from-words';

export async function getWordDetailsAction(
  input: GenerateWordDetailsInput
): Promise<GenerateWordDetailsOutput> {
  return generateWordDetails(input);
}

export async function evaluateAnswerAction(
  input: EvaluateFillInTheBlankInput
): Promise<EvaluateFillInTheBlankOutput> {
  return evaluateFillInTheBlank(input);
}

export async function translateTextAction(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateText(input);
}

export async function generateNewWordsAndQuizAction(
  input: GenerateNewWordsAndQuizInput
): Promise<GenerateNewWordsAndQuizOutput> {
  return generateNewWordsAndQuiz(input);
}

export async function textToSpeechAction(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeech(input);
}

export async function generateQuizFromWordsAction(
  input: GenerateQuizFromWordsInput
): Promise<GenerateQuizFromWordsOutput> {
  return generateQuizFromWords(input);
}
