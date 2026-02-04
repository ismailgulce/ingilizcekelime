'use client';

import type { Word } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function ExampleSentence({ sentence, translation }: { sentence: string; translation: string }) {
  return (
    <li className="flex flex-col gap-1">
        <p className="text-muted-foreground">{sentence}</p>
        {translation && (
            <p className="pl-4 text-sm text-primary/80 border-l-2 border-primary/50">{translation}</p>
        )}
    </li>
  );
}

export function WordDetails({ word }: { word: Word }) {
  return (
    <div className="space-y-4 pt-2">
      <div>
        <h3 className="font-headline text-lg font-semibold text-card-foreground">Synonyms</h3>
        <div className="flex flex-wrap gap-2 pt-2">
          {(word.synonyms || []).map(synonym => <Badge key={synonym} variant="secondary">{synonym}</Badge>)}
            {(!word.synonyms || word.synonyms.length === 0) && <p className="text-sm text-muted-foreground">No synonyms found.</p>}
        </div>
      </div>
      <div>
        <h3 className="font-headline text-lg font-semibold text-card-foreground">Example Sentences</h3>
        <ul className="space-y-4 pt-2">
          {(word.exampleSentences || []).map((ex, i) => <ExampleSentence key={i} sentence={ex.sentence} translation={ex.translation} />)}
          {(!word.exampleSentences || word.exampleSentences.length === 0) && <p className="text-sm text-muted-foreground">No example sentences found.</p>}
        </ul>
      </div>
    </div>
  );
}
