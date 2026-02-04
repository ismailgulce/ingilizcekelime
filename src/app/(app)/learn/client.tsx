'use client';

import { useState } from 'react';
import { generateNewWordsAndQuizAction } from '@/app/lib/actions';
import type { NewWord, QuizQuestion } from '@/ai/flows/generate-new-words-and-quiz';
import type { UserAnswer } from '@/lib/types';
import { useVocabulary } from '@/contexts/VocabularyContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2, Plus, ArrowRight, Check, X, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { WordDetails } from '@/components/word-details';

const WORD_COUNT = 5;

interface GeneratedData {
  words: NewWord[];
  quiz: QuizQuestion[];
}

export default function LearnClientPage() {
  const [data, setData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setQuizStarted(false);

    try {
      const result = await generateNewWordsAndQuizAction({ count: WORD_COUNT });
      setData(result);
    } catch (e) {
      setError('Could not generate new words. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setData(null);
    setQuizStarted(false);
    setError(null);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-headline text-3xl md:text-4xl">Learn New Words</h1>

      {!data && !isLoading && !error && (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
            <Lightbulb className="h-16 w-16 text-yellow-400" />
            <CardTitle className="mt-4 font-headline text-2xl">Discover and Master New Vocabulary</CardTitle>
            <CardDescription className="mt-2 max-w-lg">
                Get a fresh set of words automatically chosen for you. Study their meanings and examples, then test your knowledge with a custom-generated quiz.
            </CardDescription>
            <Button onClick={handleGenerate} className="mt-6">
                Generate New Words & Quiz
            </Button>
        </Card>
      )}

      {isLoading && <LearnSkeleton />}

      {error && (
        <div className="text-destructive text-center p-8">
            <p>{error}</p>
            <Button onClick={handleGenerate} variant="secondary" className="mt-4">Try Again</Button>
        </div>
      )}

      {data && !quizStarted && (
        <WordReview words={data.words} onStartQuiz={() => setQuizStarted(true)} />
      )}

      {data && quizStarted && (
        <Quiz questions={data.quiz} onReset={resetFlow} />
      )}
    </main>
  );
}

function WordReview({ words, onStartQuiz }: { words: NewWord[], onStartQuiz: () => void }) {
    const { addWord, words: existingWords } = useVocabulary();
    const { toast } = useToast();

    const handleAddAll = () => {
        let addedCount = 0;
        words.forEach(newWord => {
            const isAlreadyInList = existingWords.some(w => w.word.toLowerCase() === newWord.word.toLowerCase());
            if (!isAlreadyInList) {
                const success = addWord(newWord.word, newWord);
                if (success) addedCount++;
            }
        });
        toast({
            title: "Words Added",
            description: `${addedCount} new word(s) have been added to your list.`,
        });
    }

    return (
        <Card className="animate-in fade-in-0">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Your New Words</CardTitle>
                <CardDescription>Study these words, then start the quiz when you're ready.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {words.map((word) => (
                        <AccordionItem key={word.word} value={word.word} className="border-b-0">
                            <Card className="bg-muted/50">
                                <AccordionTrigger className="w-full p-6 text-left hover:no-underline">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between w-full">
                                            <CardTitle className="font-headline text-2xl capitalize">{word.word}</CardTitle>
                                            <Badge variant="secondary">{word.wordType}</Badge>
                                        </div>
                                        <CardDescription className="text-lg text-primary">{(word.turkishTranslations || []).join(', ')}</CardDescription>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <WordDetails word={word as any} />
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={handleAddAll} variant="secondary" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" /> Add All to My Words
                </Button>
                <Button onClick={onStartQuiz} className="flex-1">
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
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
    const score = Math.round((correctAnswers / questions.length) * 100);

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
                                    {!userAnswer?.isCorrect && <p className="text-sm">Your answer: <span className="font-bold">{userAnswer?.answer}</span></p>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={onReset} className="w-full">Learn New Words</Button>
            </CardFooter>
        </Card>
    );
}


function LearnSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(WORD_COUNT)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </CardContent>
      <CardFooter className="flex gap-2">
         <Skeleton className="h-10 flex-1" />
         <Skeleton className="h-10 flex-1" />
      </CardFooter>
    </Card>
  );
}
