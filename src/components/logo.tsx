import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  const logoImage = PlaceHolderImages.find(img => img.id === 'logo');

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logoImage && (
        <Image
          src={logoImage.imageUrl}
          alt={logoImage.description}
          width={40}
          height={40}
          className="rounded-md"
          data-ai-hint={logoImage.imageHint}
        />
      )}
      <span className="font-headline text-2xl font-bold tracking-wider text-sidebar-foreground">
        LinguaLeap
      </span>
    </div>
  );
}
