import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@lib/utils.ts';
import { EllipsisVertical } from 'lucide-react';

export default function MultipleActionButton({
  someSelected,
  handleClick,
}: {
  someSelected: boolean;
  handleClick: ({ x, y }: { x: number; y: number }) => void;
}) {
  return (
    <AnimatePresence>
      {someSelected && (
        <motion.button
          onClick={e => handleClick({ x: e.clientX, y: e.clientY })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'z-20 absolute right-2 top-1 flex items-center gap-1 rounded-full bg-stone-400/50',
            'transition-all hover:bg-stone-400/80 hover:text-stone-800 hover:shadow-sm',
            'dark:bg-stone-600/50 dark:hover:bg-stone-600/80 dark:hover:text-stone-200',
            'px-2 py-1 pr-4 backdrop-blur-lg',
          )}
        >
          <EllipsisVertical className={'h-4 w-4'} />
          Actions
        </motion.button>
      )}
    </AnimatePresence>
  );
}
