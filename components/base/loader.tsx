import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const Loader = ({ className }: { className?: string }) => {
  return (
    <Loader2
      className={cn('h-9 w-9 text-primary/60 animate-spin', className)}
    />
  );
};
