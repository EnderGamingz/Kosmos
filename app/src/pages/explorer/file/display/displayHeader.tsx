import { FileModel } from '@models/file.ts';
import { motion } from 'framer-motion';
import { Checkbox } from '@nextui-org/react';

export function DisplayHeader({
  file,
  selected,
  onSelect,
}: {
  file: FileModel;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className={'flex items-center gap-2'}>
      {selected !== undefined && (
        <motion.div layoutId={`check-${file.id}`}>
          <Checkbox
            isSelected={selected}
            onChange={() => onSelect?.(file.id)}
          />
        </motion.div>
      )}
      <motion.p
        exit={{ opacity: 0 }}
        layoutId={`title-${file.id}`}
        className={
          'select-all whitespace-break-spaces break-all text-xl font-semibold'
        }>
        {file.file_name}
      </motion.p>
    </div>
  );
}
