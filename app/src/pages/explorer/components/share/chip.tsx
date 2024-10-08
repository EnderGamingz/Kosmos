import { ReactNode } from 'react';
import tw from '@utils/classMerge.ts';

export function Chip({
  content,
  onClick,
  selected,
}: {
  content: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={tw(
        'rounded-full px-2 py-0.5 text-xs font-light',
        'flex items-center gap-1 outline outline-1 outline-stone-800/20',
        'transition-colors [&_svg]:h-3 [&_svg]:w-3',
        onClick ? 'cursor-pointer' : 'cursor-default',
        'dark:bg-stone-800/60 dark:text-stone-100',
        Boolean(selected) && 'bg-stone-600 text-stone-100 dark:bg-stone-500',
      )}>
      {content}
    </div>
  );
}
