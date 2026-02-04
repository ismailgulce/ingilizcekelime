'use server';
/**
 * @fileOverview Flow to evaluate fill-in-the-blank exercises using an LLM.
 *
 * - evaluateFillInTheBlank - A function that evaluates the user's answer in a fill-in-the-blank exercise.
 * - EvaluateFillInTheBlankInput - The input type for the evaluateFillInTheBlank function.
 * - EvaluateFillInTheBlankOutput - The return type for the evaluateFillInTheBlank function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateFillInTheBlankInputSchema = z.object({
  sentence: z.string().describe('The sentence with a blank to be filled.'),
  userAnswer: z.string().describe('The user provided answer for the blank.'),
  correctAnswer: z.string().describe('The correct answer for the blank.'),
});
export type EvaluateFillInTheBlankInput = z.infer<
  typeof EvaluateFillInTheBlankInputSchema
>;

const EvaluateFillInTheBlankOutputSchema = z.object({
  isCorrect: z
    .boolean()
    .describe(
      'Whether the user answer is correct, taking into account synonyms and context.'
    ),
  explanation: z.string().describe('Explanation of why the answer is correct or incorrect.'),
});
export type EvaluateFillInTheBlankOutput = z.infer<
  typeof EvaluateFillInTheBlankOutputSchema
>;

export async function evaluateFillInTheBlank(
  input: EvaluateFillInTheBlankInput
): Promise<EvaluateFillInTheBlankOutput> {
  return evaluateFillInTheBlankFlow(input);
}

const evaluateFillInTheBlankPrompt = ai.definePrompt({
  name: 'evaluateFillInTheBlankPrompt',
  input: {schema: EvaluateFillInTheBlankInputSchema},
  output: {schema: EvaluateFillInTheBlankOutputSchema},
  prompt: `You are an expert evaluator of fill-in-the-blank exercises.

You are given a sentence with a blank, the user's answer, and the correct answer.

Determine if the user's answer is correct, even if it's not an exact match, considering synonyms and the context of the sentence.

Sentence: {{{sentence}}}
User's Answer: {{{userAnswer}}}
Correct Answer: {{{correctAnswer}}}

Return a JSON object with an isCorrect boolean field and an explanation field explaining your reasoning.
`,
});

const evaluateFillInTheBlankFlow = ai.defineFlow(
  {
    name: 'evaluateFillInTheBlankFlow',
    inputSchema: EvaluateFillInTheBlankInputSchema,
    outputSchema: EvaluateFillInTheBlankOutputSchema,
  },
  async input => {
    const {output} = await evaluateFillInTheBlankPrompt(input);
    return output!;
  }
);
