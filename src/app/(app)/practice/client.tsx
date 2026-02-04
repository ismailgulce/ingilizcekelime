'use client';

import { useState, useEffect, useMemo } from 'react';
import { useVocabulary } from '@/contexts/VocabularyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { generateQuizFromWordsAction, evaluateAnswerAction } from '@/app/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { BrainCircuit, BookCheck, ThumbsUp, ThumbsDown, Loader2, ListChecks, ArrowRight, Check, X, Award } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { QuizQuestion, UserAnswer } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PracticeClientPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-headline text-3xl md:text-4xl">Practice Session</h1>

      <Tabs defaultValue="fill-in-the-blank" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fill-in-the-blank">Words to Review</TabsTrigger>
          <TabsTrigger value="recent-words">Recent Words</TabsTrigger>
          <TabsTrigger value="multiple-choice">Custom Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="fill-in-the-blank" className="mt-4">
          <FillInTheBlankContainer />
        </TabsContent>
        <TabsContent value="recent-words" className="mt-4">
          <RecentWordsQuizContainer />
        </TabsContent>
        <TabsContent value="multiple-choice" className="mt-4">
          <MultipleChoiceQuizContainer />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function RecentWordsQuizContainer() {
    const { isLoaded, words } = useVocabulary();
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isLoaded) {
        return <PracticeSkeleton />;
    }

    const sortedWords = [...words].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    const recentWords = sortedWords.slice(0, 5);

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setError(null);
        setQuiz(null);

        try {
            const wordStrings = recentWords.map(w => w.word);
            const result = await generateQuizFromWordsAction({ words: wordStrings, questionCount: 5 });
            if (!result.quiz || result.quiz.length === 0) {
              setError("The AI could not generate a quiz. Please try again.");
              setIsLoading(false);
              return;
            }
            setQuiz(result.quiz);
        } catch (e) {
            setError("Could not generate the quiz. Please try again later.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setQuiz(null);
        setError(null);
        setIsLoading(false);
    };

    if (quiz) {
        return <Quiz questions={quiz} onReset={reset} />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quiz on Recent Words</CardTitle>
                <CardDescription>
                    Test your knowledge on the last 5 words you added to your vocabulary.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentWords.length < 5 &&
                    <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                        <ListChecks className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Not Enough Words</AlertTitle>
                        <AlertDescription>
                            You need to have at least 5 words in your vocabulary to take this quiz.
                             <Button variant="link" asChild className="p-0 h-auto ml-1"><Link href="/dictionary">Add more words.</Link></Button>
                        </AlertDescription>
                    </Alert>
                }
                 {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {recentWords.length >= 5 && (
                    <div>
                        <p className="text-sm font-medium mb-2">This quiz will be on the following words:</p>
                        <div className="flex flex-wrap gap-2">
                            {recentWords.map(word => (
                                <Badge key={word.word} variant="secondary">{word.word}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleGenerateQuiz} disabled={isLoading || recentWords.length < 5}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                    Start 5-Question Quiz
                </Button>
            </CardFooter>
        </Card>
    );
}

function FillInTheBlankContainer() {
  const { isLoaded, getWordsToReview, updateWordReview } = useVocabulary();
  const [wordsToReview, setWordsToReview] = useState(getWordsToReview());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (isLoaded) {
      setWordsToReview(getWordsToReview());
      setCurrentWordIndex(0);
    }
  }, [isLoaded, getWordsToReview]);

  const handleNextWord = (isCorrect: boolean) => {
    const word = wordsToReview[currentWordIndex];
    if (word) {
      updateWordReview(word.word, isCorrect);
    }
    setTimeout(() => {
        setWordsToReview(prev => prev.filter((_, i) => i !== currentWordIndex));
    }, 2000);
  };
  
  if (!isLoaded) {
    return <PracticeSkeleton />;
  }

  if (wordsToReview.length === 0) {
    return (
      <Card className="text-center p-8 flex flex-col items-center justify-center min-h-[400px]">
        <BookCheck className="h-24 w-24 text-green-500" />
        <h2 className="font-headline text-3xl mt-4">All Done!</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          You have no words to review right now. Great job keeping your vocabulary up to date!
        </p>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </Card>
    );
  }

  const currentWord = wordsToReview[currentWordIndex];

  return (
    <>
      {currentWord ? (
        <FillInTheBlankExercise
          key={currentWord.word}
          word={currentWord.word}
          sentences={currentWord.exampleSentences.map(ex => ex.sentence)}
          onComplete={handleNextWord}
        />
      ) : (
         <Card className="text-center p-8 flex flex-col items-center justify-center min-h-[400px]">
            <BookCheck className="h-24 w-24 text-green-500" />
            <h2 className="font-headline text-3xl mt-4">Session Complete!</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
            You've reviewed all your words for now.
            </p>
            <Button asChild className="mt-6">
                <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
        </Card>
      )}
    </>
  );
}


function MultipleChoiceQuizContainer() {
    const { isLoaded, words } = useVocabulary();
    const [questionCount, setQuestionCount] = useState(10);
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    if (!isLoaded) {
        return <PracticeSkeleton />;
    }
    
    const maxQuestions = words.length;
    
    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setError(null);
        setQuiz(null);

        try {
            const wordStrings = words.map(w => w.word);
            const result = await generateQuizFromWordsAction({ words: wordStrings, questionCount });
            if (!result.quiz || result.quiz.length === 0) {
              setError("The AI could not generate a quiz. Please try again.");
              setIsLoading(false);
              return;
            }
            setQuiz(result.quiz);
        } catch (e) {
            setError("Could not generate the quiz. Please try again later.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const reset = () => {
        setQuiz(null);
        setError(null);
        setIsLoading(false);
    };
    
    if (quiz) {
        return <Quiz questions={quiz} onReset={reset} />;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Custom Quiz</CardTitle>
                <CardDescription>
                    Test your knowledge on all the words you've learned so far with a multiple choice quiz.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {words.length < 5 &&
                    <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                        <ListChecks className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Not Enough Words</AlertTitle>
                        <AlertDescription>
                            You need to have at least 5 words in your vocabulary to generate a quiz.
                             <Button variant="link" asChild className="p-0 h-auto ml-1"><Link href="/dictionary">Add more words.</Link></Button>
                        </AlertDescription>
                    </Alert>
                }
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="grid gap-2">
                    <Label htmlFor="question-count">Number of Questions: <span className="text-primary font-bold">{questionCount}</span></Label>
                    <Slider
                        id="question-count"
                        min={5}
                        max={20}
                        step={1}
                        value={[questionCount]}
                        onValueChange={(value) => setQuestionCount(value[0])}
                        disabled={isLoading || words.length < 5}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleGenerateQuiz} disabled={isLoading || words.length < 5}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                    Generate Quiz
                </Button>
            </CardFooter>
        </Card>
    );
}

function Quiz({ questions, onReset }: { questions: QuizQuestion[], onReset: () => void }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const quizFinished = currentQuestionIndex === questions.length;
    const progress = (currentQuestionIndex / questions.length) * 100;

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentQuestion.correctAnswer;
        setUserAnswers(prev => [...prev, { questionIndex: currentQuestionIndex, answer, isCorrect }]);
    };

    const handleNext = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (quizFinished) {
        return <QuizResults userAnswers={userAnswers} questions={questions} onReset={onReset}/>;
    }
    
    if(!currentQuestion) {
        return <QuizResults userAnswers={userAnswers} questions={questions} onReset={onReset}/>;
    }

    return (
        <Card className="animate-in fade-in-0">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Quiz Time!</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-lg font-semibold">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = currentQuestion.correctAnswer === option;
                        
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="lg"
                                className={cn(
                                    "justify-start text-left h-auto py-3 whitespace-normal",
                                    isAnswered && isCorrect && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200",
                                    isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200"
                                )}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                            >
                                {isAnswered && isSelected && isCorrect && <Check className="mr-2 text-green-600" />}
                                {isAnswered && isSelected && !isCorrect && <X className="mr-2 text-red-600" />}
                                {option}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter>
                {isAnswered && (
                    <Button onClick={handleNext} className="ml-auto">
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function QuizResults({ userAnswers, questions, onReset }: { userAnswers: UserAnswer[], questions: QuizQuestion[], onReset: () => void }) {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    return (
        <Card className="text-center animate-in fade-in-0 zoom-in-95">
            <CardHeader>
                <div className="mx-auto bg-yellow-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <Award className="h-10 w-10 text-yellow-500" />
                </div>
                <CardTitle className="font-headline text-3xl mt-4">Quiz Complete!</CardTitle>
                <CardDescription>You scored</CardDescription>
                <p className="text-6xl font-bold text-primary">{score}%</p>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You answered {correctAnswers} out of {questions.length} questions correctly.</p>

                <div className="mt-6 text-left">
                    <h3 className="font-headline text-lg text-center">Review your answers:</h3>
                    <ul className="mt-4 space-y-4">
                        {questions.map((q, i) => {
                            const userAnswer = userAnswers.find(a => a.questionIndex === i);
                            return (
                                <li key={i} className={cn("p-3 rounded-md", userAnswer?.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
                                    <p className="font-semibold">{i + 1}. {q.question}</p>
                                    <p className="text-sm">Correct answer: <span className="font-bold">{q.correctAnswer}</span></p>
                                    {userAnswer && !userAnswer.isCorrect && <p className="text-sm">Your answer: <span className="font-bold">{userAnswer?.answer}</span></p>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={onReset} className="w-full">Take Another Quiz</Button>
            </CardFooter>
        </Card>
    );
}


function FillInTheBlankExercise({ word, sentences, onComplete }: { word: string; sentences: string[]; onComplete: (isCorrect: boolean) => void; }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sentenceData = useMemo(() => {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    const blankedSentence = sentence.replace(new RegExp(`\\b${word}\\b`, 'gi'), '______');
    return { sentence, blankedSentence };
  }, [word, sentences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    setIsLoading(true);

    const evaluation = await evaluateAnswerAction({
      sentence: sentenceData.sentence,
      userAnswer,
      correctAnswer: word,
    });

    setResult(evaluation);
    setIsLoading(false);
    onComplete(evaluation.isCorrect);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Fill in the Blank</CardTitle>
        <CardDescription>Complete the sentence below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-lg md:text-xl p-4 bg-muted rounded-md font-serif">
          {sentenceData.blankedSentence}
        </p>
        {!result && (
          <form onSubmit={handleSubmit} className="flex w-full max-w-lg mx-auto items-start space-x-2">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Check'}
            </Button>
          </form>
        )}
        {result && (
          <Alert variant={result.isCorrect ? 'default' : 'destructive'} className={cn(result.isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700' : '')}>
            {result.isCorrect ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
            <AlertTitle>{result.isCorrect ? 'Correct!' : 'Not Quite'}</AlertTitle>
            <AlertDescription>
                {result.explanation}
                <p className="mt-2 font-semibold">The correct answer was: <span className="text-primary">{word}</span></p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


function PracticeSkeleton() {
  return (
    <div className="mt-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex w-full max-w-lg mx-auto items-center space-x-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
