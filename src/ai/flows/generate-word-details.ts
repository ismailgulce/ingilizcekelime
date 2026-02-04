'use server';

/**
 * @fileOverview A flow that generates word details including translation, type, synonyms and example sentences.
 *
 * - generateWordDetails - A function that generates the word details.
 * - GenerateWordDetailsInput - The input type for the generateWordDetails function.
 * - GenerateWordDetailsOutput - The return type for the generateWordDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordDetailsInputSchema = z.object({
  word: z.string().describe('The English word to generate details for.'),
});
export type GenerateWordDetailsInput = z.infer<typeof GenerateWordDetailsInputSchema>;

const ExampleSentenceSchema = z.object({
  sentence: z.string().describe('The example sentence in English.'),
  translation: z.string().describe('The Turkish translation of the example sentence.'),
});

const GenerateWordDetailsOutputSchema = z.object({
  turkishTranslations: z.array(z.string()).describe('A list of Turkish translations of the word.'),
  wordType: z.string().describe('The type of the word in Turkish (isim, fiil, sıfat, etc.).'),
  synonyms: z.array(z.string()).describe('A list of synonyms for the word.'),
  exampleSentences: z.array(ExampleSentenceSchema).describe('Example sentences using the word, along with their Turkish translations.'),
});
export type GenerateWordDetailsOutput = z.infer<typeof GenerateWordDetailsOutputSchema>;

export async function generateWordDetails(input: GenerateWordDetailsInput): Promise<GenerateWordDetailsOutput> {
  return generateWordDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordDetailsPrompt',
  input: {schema: GenerateWordDetailsInputSchema},
  output: {schema: GenerateWordDetailsOutputSchema},
  prompt: `You are a helpful language learning assistant. For the given English word, provide the following information:

*   A list of common Turkish translations
*   Word type in Turkish (e.g., isim, fiil, sıfat)
*   A list of synonyms
*   Two example sentences in English, each with its Turkish translation.

Word: {{{word}}}`,
});

const generateWordDetailsFlow = ai.defineFlow(
  {
    name: 'generateWordDetailsFlow',
    inputSchema: GenerateWordDetailsInputSchema,
    outputSchema: GenerateWordDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
