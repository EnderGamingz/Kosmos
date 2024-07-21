import { AnimatePresence, motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export function MultipleActionButton({
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
          onClick={e => {
            handleClick({ x: e.clientX, y: e.clientY });
          }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={tw(
            'absolute right-2 top-2 flex items-center gap-1 rounded-full bg-stone-400/50',
            'transition-all hover:bg-stone-400/80 hover:text-stone-800 hover:shadow-sm',
            'px-2 py-1 pr-4 backdrop-blur-lg',
          )}>
          <EllipsisVerticalIcon className={'h-5 w-5'} />
          Actions
        </motion.button>
      )}
    </AnimatePresence>
  );
}
