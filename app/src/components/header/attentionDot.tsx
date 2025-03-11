import { cn } from '@lib/utils.ts';

export function AttentionDot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute w-2 h-2 rounded-full bg-blue-400 animate-pulse top-1 right-1',
        className,
      )}
    />
  );
}