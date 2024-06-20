import { FileModel } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export function FileDisplayFooter({ file }: { file: FileModel }) {
  return (
    <div
      className={tw(
        '!mt-auto flex flex-col items-center justify-between gap-2 md:flex-row',
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
  );
}
