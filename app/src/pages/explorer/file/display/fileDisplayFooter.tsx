import { FileModel } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/solid';

export function FileDisplayFooter({
  file,
  onClose,
}: {
  file: FileModel;
  onClose: () => void;
}) {
  return (
    <div className={'!mt-auto space-y-2'}>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.4 }}
        onClick={onClose}
        className={tw(
          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-1 ',
          'text-stone-600 transition-colors hover:bg-stone-200',
          'outline outline-1 outline-stone-400/20',
        )}>
        <XMarkIcon className={'h-4 w-4'} /> Close
      </motion.button>
      <div
        className={tw(
          'flex flex-col items-center justify-between gap-2 sm:flex-row',
          'text-xs text-stone-500',
        )}>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: 0.3 }}>
          Created {formatDistanceToNow(file.created_at, { addSuffix: true })}
        </motion.p>
        <motion.p layoutId={`updated-${file.id}`}>
          Updated {formatDistanceToNow(file.updated_at, { addSuffix: true })}
        </motion.p>
      </div>
    </div>
  );
}
