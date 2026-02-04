'use client';

import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PronunciationButton({ word }: { word: string }) {
  const { toast } = useToast();

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Unsupported Feature",
        description: "Your browser does not support the Web Speech API.",
      });
      return;
    }
    
    // If speaking, cancel it to avoid overlap
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance Error', event);
      toast({
        variant: "destructive",
        title: "Pronunciation Error",
        description: "Could not pronounce the word. Please try again.",
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button asChild variant="ghost" size="icon" onClick={handlePronounce} aria-label={`Listen to ${word}`} className="h-8 w-8">
      <span role="button" tabIndex={0}>
        <Volume2 className="h-5 w-5" />
      </span>
    </Button>
  );
}
