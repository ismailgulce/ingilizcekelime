'use server';
/**
 * @fileOverview Flow to generate a quiz from a list of words.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionSchema = z.object({
    question: z.string().describe('The quiz question.'),
    options: z.array(z.string()).describe('An array of 4 multiple choice options.'),
    correctAnswer: z.string().describe('The correct answer from the options.'),
    word: z.string().describe('The target word from the list that this question is about.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const GenerateQuizFromWordsInputSchema = z.object({
  words: z.array(z.string()).describe('The list of English words to base the quiz on.'),
  questionCount: z.number().describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizFromWordsInput = z.infer<typeof GenerateQuizFromWordsInputSchema>;

const GenerateQuizFromWordsOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe('The generated quiz questions.'),
});
export type GenerateQuizFromWordsOutput = z.infer<typeof GenerateQuizFromWordsOutputSchema>;

export async function generateQuizFromWords(
  input: GenerateQuizFromWordsInput
): Promise<GenerateQuizFromWordsOutput> {
  return generateQuizFromWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromWordsPrompt',
  input: {schema: GenerateQuizFromWordsInputSchema},
  output: {schema: GenerateQuizFromWordsOutputSchema},
  prompt: `You are a helpful language learning assistant. Generate a multiple-choice quiz with {{{questionCount}}} questions based on the following list of English words:

{{#each words}}
- {{{this}}}
{{/each}}

The questions should be varied:
- Some should ask for the definition/translation.
- Some should ask for a synonym.
- Some should be a "fill in the blank".

Each quiz question must have 4 options. Make sure the correct answer is one of the options.
Ensure the questions are distributed among the provided words.
`,
});

const generateQuizFromWordsFlow = ai.defineFlow(
  {
    name: 'generateQuizFromWordsFlow',
    inputSchema: GenerateQuizFromWordsInputSchema,
    outputSchema: GenerateQuizFromWordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
