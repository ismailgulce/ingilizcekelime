'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getWordDetailsAction } from '@/app/lib/actions';
import type { GenerateWordDetailsOutput } from '@/ai/flows/generate-word-details';
import { Skeleton } from '@/components/ui/skeleton';
import { useVocabulary } from '@/contexts/VocabularyContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Search, Check } from 'lucide-react';

const formSchema = z.object({
  word: z.string().min(1, 'Please enter a word.').regex(/^[a-zA-Z\s'-]+$/, 'Please enter a valid English word.'),
});

function ExampleSentenceItem({ sentence, translation }: { sentence: string; translation: string }) {
  return (
    <li className="flex flex-col gap-1">
      <p className="text-muted-foreground">{sentence}</p>
      {translation && (
        <p className="pl-4 text-sm text-primary/80 border-l-2 border-primary/50">{translation}</p>
      )}
    </li>
  );
}

export default function DictionaryPage() {
  const [wordDetails, setWordDetails] = useState<GenerateWordDetailsOutput | null>(null);
  const [searchedWord, setSearchedWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addWord, words } = useVocabulary();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
    },
  });

  const isWordInList = words.some(w => w.word.toLowerCase() === searchedWord.toLowerCase());

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setWordDetails(null);
    setSearchedWord(values.word);

    try {
      const details = await getWordDetailsAction({ word: values.word });
      setWordDetails(details);
    } catch (e) {
      setError('Could not fetch details for this word. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddWord = () => {
    if (wordDetails) {
      const success = addWord(searchedWord, wordDetails);
      if (success) {
        toast({
          title: 'Word Added!',
          description: `"${searchedWord}" has been added to your list.`,
        });
      }
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-headline text-3xl md:text-4xl">Dictionary</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Find a Word</CardTitle>
          <CardDescription>Enter an English word to get its translation, type, synonyms, and example sentences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-lg items-start space-x-2">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="e.g. benevolent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {error && <p className="text-destructive">{error}</p>}
      {isLoading && <WordDetailsSkeleton />}
      {wordDetails && (
        <Card className="animate-in fade-in-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline text-3xl capitalize">{searchedWord}</CardTitle>
              <Badge variant="secondary">{wordDetails.wordType}</Badge>
            </div>
            <CardDescription className="text-xl text-primary">{(wordDetails.turkishTranslations || []).join(', ')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-lg font-semibold">Synonyms</h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {wordDetails.synonyms.map(synonym => <Badge key={synonym}>{synonym}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold">Example Sentences</h3>
              <ul className="space-y-4 pt-2">
                {wordDetails.exampleSentences.map((sentence, i) => <ExampleSentenceItem key={i} sentence={sentence.sentence} translation={sentence.translation} />)}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddWord} disabled={isWordInList} className="w-full">
              {isWordInList ? <><Check className="mr-2 h-4 w-4" />In Your List</> : <><Plus className="mr-2 h-4 w-4" />Add to My Words</>}
            </Button>
          </CardFooter>
        </Card>
      )}
      {!isLoading && !wordDetails && !error && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 font-headline text-xl">Discover New Words</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your search results will appear here.</p>
        </div>
      )}
    </main>
  );
}

function WordDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
