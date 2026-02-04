'use server';
/**
 * @fileOverview Flow to generate new words and a quiz for them.
 *
 * - generateNewWordsAndQuiz - A function that generates new words and a quiz.
 * - GenerateNewWordsAndQuizInput - The input type.
 * - GenerateNewWordsAndQuizOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExampleSentenceSchema = z.object({
  sentence: z.string().describe('The example sentence in English.'),
  translation: z.string().describe('The Turkish translation of the example sentence.'),
});

const NewWordSchema = z.object({
  word: z.string().describe('The English word.'),
  turkishTranslations: z.array(z.string()).describe('The Turkish translations of the word.'),
  wordType: z.string().describe('The type of the word in Turkish (isim, fiil, sıfat, etc.).'),
  synonyms: z.array(z.string()).describe('A list of synonyms for the word.'),
  exampleSentences: z.array(ExampleSentenceSchema).describe('Example sentences using the word and their Turkish translations.'),
});
export type NewWord = z.infer<typeof NewWordSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The quiz question.'),
    options: z.array(z.string()).describe('An array of 4 multiple choice options.'),
    correctAnswer: z.string().describe('The correct answer from the options.'),
    word: z.string().describe('The target word from the list that this question is about.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;


const GenerateNewWordsAndQuizInputSchema = z.object({
  count: z.number().describe('The number of new words to generate.'),
});
export type GenerateNewWordsAndQuizInput = z.infer<typeof GenerateNewWordsAndQuizInputSchema>;

const GenerateNewWordsAndQuizOutputSchema = z.object({
  words: z.array(NewWordSchema).describe('The list of generated words with their details.'),
  quiz: z.array(QuizQuestionSchema).describe('A 10-question multiple-choice quiz based on the generated words.'),
});
export type GenerateNewWordsAndQuizOutput = z.infer<typeof GenerateNewWordsAndQuizOutputSchema>;

export async function generateNewWordsAndQuiz(
  input: GenerateNewWordsAndQuizInput
): Promise<GenerateNewWordsAndQuizOutput> {
  return generateNewWordsAndQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewWordsAndQuizPrompt',
  input: {schema: GenerateNewWordsAndQuizInputSchema},
  output: {schema: GenerateNewWordsAndQuizOutputSchema},
  prompt: `You are a helpful language learning assistant for Turkish speakers learning English.

Generate {{{count}}} new intermediate-level English words for them to learn.

For each word, provide:
* The word itself.
* A list of its Turkish translations.
* Its word type in Turkish (e.g., isim, fiil, sıfat).
* A list of English synonyms.
* Two example sentences in English, each with its Turkish translation.

After generating the words, create a 10-question multiple-choice quiz based on these new words.
The questions should be varied:
- Some should ask for the definition/translation.
- Some should ask for a synonym.
- Some should be a "fill in the blank" using one of the example sentences.

Each quiz question must have 4 options. Make sure the correct answer is one of the options.
Ensure the questions are distributed among the generated words.
`,
});

const generateNewWordsAndQuizFlow = ai.defineFlow(
  {
    name: 'generateNewWordsAndQuizFlow',
    inputSchema: GenerateNewWordsAndQuizInputSchema,
    outputSchema: GenerateNewWordsAndQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
