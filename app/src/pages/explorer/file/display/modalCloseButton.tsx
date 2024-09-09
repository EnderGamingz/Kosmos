import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { XMarkIcon } from '@heroicons/react/24/solid';

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.4 }}
      onClick={onClick}
      className={tw(
        'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-1 ',
        'text-stone-600 transition-colors hover:bg-stone-200',
        'outline outline-1 outline-stone-400/20',
        'dark:text-stone-400 dark:hover:bg-stone-700/20',
      )}>
      <XMarkIcon className={'h-4 w-4'} /> Close
    </motion.button>
  );
}
