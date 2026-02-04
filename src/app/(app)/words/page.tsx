'use client';

import { useState } from 'react';
import { useVocabulary } from '@/contexts/VocabularyContext';
import { Card, CardContent, CardDescription, CardTitle, CardFooter, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import { WordDetails } from '@/components/word-details';
import { PronunciationButton } from '@/components/pronunciation-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function WordsPage() {
  const { isLoaded, words, removeWord } = useVocabulary();
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirmDelete = () => {
    if (wordToDelete) {
      removeWord(wordToDelete);
      toast({
        title: "Word Deleted",
        description: `"${wordToDelete}" has been successfully removed from your list.`,
      });
      setWordToDelete(null);
    }
  };

  if (!isLoaded) {
    return <WordsSkeleton />;
  }

  const sortedWords = [...words].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());

  if (words.length === 0) {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
            <Star className="h-24 w-24 text-muted-foreground" />
            <h1 className="font-headline text-3xl">Your Vocabulary is Empty</h1>
            <p className="max-w-md text-muted-foreground">
            Get started by looking up words in the dictionary and adding them to your list.
            </p>
            <Button asChild>
                <Link href="/dictionary">Go to Dictionary</Link>
            </Button>
        </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-headline text-3xl md:text-4xl">My Words ({words.length})</h1>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {sortedWords.map((word) => (
          <AccordionItem key={word.word} value={word.word} className="border-b-0">
            <Card>
              <AccordionTrigger className="w-full p-6 text-left hover:no-underline">
                  <div className="flex-1">
                      <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                             <CardTitle className="font-headline text-2xl capitalize">{word.word}</CardTitle>
                             <PronunciationButton word={word.word} />
                          </div>
                          <Badge variant="secondary">{word.wordType}</Badge>
                      </div>
                      <CardDescription className="text-lg text-primary">{(word.turkishTranslations || []).join(', ')}</CardDescription>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-0">
                <WordDetails word={word} />
                <div className="mt-4 border-t pt-4 text-sm text-muted-foreground flex justify-between">
                      <p>
                          Proficiency Level: <Badge variant="outline">{word.srsLevel}</Badge>
                      </p>
                      <p>
                          Next review: {formatDistanceToNow(parseISO(word.nextReview), { addSuffix: true })}
                      </p>
                </div>
                <CardFooter className="px-0 pt-4 pb-4 flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                        Added: {formatDistanceToNow(parseISO(word.addedDate), { addSuffix: true })}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setWordToDelete(word.word)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </CardFooter>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
       <AlertDialog open={!!wordToDelete} onOpenChange={(open) => !open && setWordToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the word
                    <span className="font-bold"> "{wordToDelete}" </span> 
                    from your vocabulary list.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function WordsSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Skeleton className="h-12 w-72" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-2/5" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <Skeleton className="mt-2 h-5 w-3/5" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
