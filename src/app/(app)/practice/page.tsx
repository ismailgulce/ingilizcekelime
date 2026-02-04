import PracticeClientPage from './client';

// Set a longer timeout for AI generation on Vercel
export const maxDuration = 60;

export default function PracticePage() {
  return <PracticeClientPage />;
}
