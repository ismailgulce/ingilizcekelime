// Spaced Repetition System intervals in days
export const SRS_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365];

/**
 * Calculates the next review date based on the current SRS level.
 * @param srsLevel The current SRS level of the word.
 * @returns An ISO string representing the next review date.
 */
export function getNextReviewDate(srsLevel: number): string {
  const interval = SRS_INTERVALS[Math.min(srsLevel, SRS_INTERVALS.length - 1)];
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date.toISOString();
}

/**
 * Calculates the next SRS level based on whether the user's answer was correct.
 * @param srsLevel The current SRS level.
 * @param correct Whether the user answered correctly.
 * @returns The new SRS level.
 */
export function getNextSrsLevel(srsLevel: number, correct: boolean): number {
    if (correct) {
        return srsLevel + 1;
    }
    return Math.max(0, srsLevel - 2); // More punitive decrement
}
