import { FileModel } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ModalCloseButton } from '@pages/explorer/file/display/modalCloseButton.tsx';

export function FileDisplayFooter({
  file,
  onClose,
}: {
  file: FileModel;
  onClose: () => void;
}) {
  return (
    <div className={'!mt-auto space-y-2'}>
      <ModalCloseButton onClick={onClose} />
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
