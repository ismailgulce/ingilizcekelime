'use client';

import { useVocabulary } from '@/contexts/VocabularyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Star, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DailyGoalSetter } from '@/components/daily-goal-setter';

export default function DashboardPage() {
  const { isLoaded, words, getWordsToReview, dailyGoal, getWordsLearnedToday } = useVocabulary();

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  const wordsToReview = getWordsToReview();
  const wordsLearnedToday = getWordsLearnedToday();
  const progress = dailyGoal > 0 ? Math.round((wordsLearnedToday.length / dailyGoal) * 100) : 0;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl md:text-4xl">Dashboard</h1>
        <DailyGoalSetter />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words to Review</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-5xl font-bold">{wordsToReview.length}</div>
            <p className="text-xs text-muted-foreground">Ready for your practice session.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="secondary" disabled={wordsToReview.length === 0}>
                <Link href="/practice">Start Review</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-5xl font-bold">
              {wordsLearnedToday.length}
              <span className="text-2xl text-muted-foreground">/{dailyGoal}</span>
            </div>
            <p className="text-xs text-muted-foreground">New words learned today.</p>
            <Progress value={progress} className="mt-2" />
          </CardContent>
          <CardFooter>
             <Button asChild className="w-full" variant="secondary">
                <Link href="/dictionary">Learn New Words</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vocabulary</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-5xl font-bold">{words.length}</div>
            <p className="text-xs text-muted-foreground">Words in your learning list.</p>
          </CardContent>
           <CardFooter>
             <Button asChild className="w-full" variant="secondary">
                <Link href="/words">View All Words</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Welcome to LinguaLeap!</CardTitle>
            <CardDescription>Your journey to mastering English vocabulary starts here. Explore the dictionary, practice with exercises, and watch your knowledge grow.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                    <Link href="/dictionary"><BookOpen className="mr-2 h-4 w-4"/>Find a Word</Link>
                </Button>
                <Button asChild className="flex-1" variant="outline">
                    <Link href="/practice"><BrainCircuit className="mr-2 h-4 w-4"/>Practice Session</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="mt-2 h-3 w-3/5" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
       <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2"/>
            <Skeleton className="h-4 w-full mt-2"/>
            <Skeleton className="h-4 w-2/3 mt-1"/>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
               <Skeleton className="h-10 flex-1"/>
               <Skeleton className="h-10 flex-1"/>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
