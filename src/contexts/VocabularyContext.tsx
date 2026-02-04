'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { VocabularyState, Word } from '@/lib/types';
import type { GenerateWordDetailsOutput } from '@/ai/flows/generate-word-details';
import { getNextReviewDate, getNextSrsLevel } from '@/lib/srs';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

interface VocabularyContextType extends Omit<VocabularyState, 'words'> {
  words: Word[]; // Firestore will not return null, but an empty array
  isLoaded: boolean;
  addWord: (word: string, details: GenerateWordDetailsOutput) => boolean;
  removeWord: (word: string) => void;
  updateWordReview: (word: string, isCorrect: boolean) => void;
  setDailyGoal: (goal: number) => void;
  getWordsToReview: () => Word[];
  getWordsLearnedToday: () => Word[];
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

const initialState: VocabularyState = {
  words: [],
  dailyGoal: 5,
};

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const { user, firestore } = useFirebase();
  const [dailyGoal, setDailyGoal] = useState(initialState.dailyGoal);

  // Collection reference for user's words in Firestore
  const userWordsColRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/userWords`);
  }, [user, firestore]);
  const { data: words, isLoading: isWordsLoading } = useCollection<Word>(userWordsColRef);

  // Ref for user's profile/settings document in Firestore
  const userProfileDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);


  // Load daily goal from user profile on mount
  useEffect(() => {
    if (user && userProfileDocRef) {
      // For simplicity, we are not using useDoc here. We'll just fetch it once.
      const getUserProfile = async () => {
        const { getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(userProfileDocRef);
        if (docSnap.exists() && docSnap.data()?.dailyGoal) {
          setDailyGoal(docSnap.data().dailyGoal);
        }
      };
      getUserProfile();
    }
  }, [user, userProfileDocRef]);

  const addWord = useCallback((word: string, details: GenerateWordDetailsOutput): boolean => {
    if (!user || !firestore) return false;
    
    if (words && words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
        return false; // Word already exists
    }
      
    const now = new Date();
    const newWord: Word = {
        word,
        ...details,
        srsLevel: 0,
        nextReview: getNextReviewDate(0),
        lastCorrect: null,
        timesCorrect: 0,
        timesIncorrect: 0,
        addedDate: now.toISOString(),
        id: '', // Firestore will assign an ID
        userId: user.uid,
    };
  
    const wordDocRef = doc(collection(firestore, `users/${user.uid}/userWords`));
    
    setDoc(wordDocRef, { ...newWord, id: wordDocRef.id, createdAt: serverTimestamp() });

    return true;
  }, [user, firestore, words]);
  
  const removeWord = useCallback((wordToRemove: string) => {
    if (!user || !firestore) return;
    const word = words?.find(w => w.word.toLowerCase() === wordToRemove.toLowerCase());
    if (word) {
      deleteDoc(doc(firestore, `users/${user.uid}/userWords/${word.id}`));
    }
  }, [user, firestore, words]);

  const updateWordReview = useCallback((word: string, isCorrect: boolean) => {
    if (!user || !firestore) return;
    const currentWord = words?.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (currentWord) {
      const newSrsLevel = getNextSrsLevel(currentWord.srsLevel, isCorrect);
      const wordDocRef = doc(firestore, `users/${user.uid}/userWords/${currentWord.id}`);
      
      updateDoc(wordDocRef, {
        srsLevel: newSrsLevel,
        nextReview: getNextReviewDate(newSrsLevel),
        lastCorrect: isCorrect ? new Date().toISOString() : currentWord.lastCorrect,
        timesCorrect: currentWord.timesCorrect + (isCorrect ? 1 : 0),
        timesIncorrect: currentWord.timesIncorrect + (isCorrect ? 0 : 1),
        updatedAt: serverTimestamp(),
      });
    }
  }, [user, firestore, words]);

  const handleSetDailyGoal = useCallback((goal: number) => {
    setDailyGoal(goal);
    if (userProfileDocRef && user) {
      setDoc(userProfileDocRef, { dailyGoal: goal, id: user.uid, email: user.email }, { merge: true });
    }
  }, [userProfileDocRef, user]);

  const getWordsToReview = useCallback(() => {
    const now = new Date();
    return (words || []).filter(word => new Date(word.nextReview) <= now).sort((a,b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [words]);
  
  const getWordsLearnedToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (words || []).filter(word => new Date(word.addedDate) >= today);
  }, [words]);

  const value: VocabularyContextType = {
    words: words || [],
    dailyGoal,
    isLoaded: !isWordsLoading,
    addWord,
    removeWord,
    updateWordReview,
    setDailyGoal: handleSetDailyGoal,
    getWordsToReview,
    getWordsLearnedToday,
  };

  return (
    <VocabularyContext.Provider value={value}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
}
