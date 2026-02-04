'use client';

import { useState } from 'react';
import { useVocabulary } from '@/contexts/VocabularyContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export function DailyGoalSetter() {
  const { dailyGoal, setDailyGoal } = useVocabulary();
  const [localGoal, setLocalGoal] = useState(dailyGoal);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setDailyGoal(localGoal);
    toast({
      title: 'Goal Updated',
      description: `Your new daily goal is ${localGoal} words.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Set Daily Goal</DialogTitle>
          <DialogDescription>
            Choose how many new words you want to learn each day.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-4xl font-bold text-primary">{localGoal}</span>
            <span className="text-muted-foreground">words/day</span>
          </div>
          <Slider
            defaultValue={[dailyGoal]}
            value={[localGoal]}
            onValueChange={(value) => setLocalGoal(value[0])}
            max={50}
            step={1}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
