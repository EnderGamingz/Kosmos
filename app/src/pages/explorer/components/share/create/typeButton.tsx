import { getShareTypeString, type ShareType } from '@models/share.ts';
import { motion } from 'framer-motion';
import { getShareTypeIcon } from '@pages/explorer/components/share/getShareTypeIcon.tsx';
import { cn } from '@lib/utils.ts';

export function TypeButton({
  type,
  selected,
  onSelect,
}: {
  type: ShareType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type={'button'}
      onClick={onSelect}
      className={cn(
        'isolate relative flex rounded-md px-3 py-1 transition-colors hover:bg-stone-800/20',
        'items-center gap-4 text-lg',
      )}
    >
      {getShareTypeIcon(type)}
      {getShareTypeString(type)}
      {selected && (
        <motion.div
          layoutId={`share-type`}
          className={'absolute inset-0 -z-10 rounded-md bg-stone-400/60'}
        />
      )}
    </button>
  );
}
