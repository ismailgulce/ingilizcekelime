import LearnClientPage from './client';

// Set a longer timeout for AI generation on Vercel
export const maxDuration = 60;

export default function LearnPage() {
  return <LearnClientPage />;
}
