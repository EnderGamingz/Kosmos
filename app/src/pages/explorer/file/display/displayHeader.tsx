import { motion } from 'framer-motion';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Checkbox } from '@/components/ui/checkbox';

export function DisplayHeader({
  file,
  selected,
  onSelect,
}: {
  file: FileModelDTO;
  selected?: boolean;
  onSelect?: (file: FileModelDTO) => void;
}) {
  return (
    <motion.div className={'flex items-center gap-2'}>
      {selected !== undefined && (
        <motion.div layoutId={`check-${file.id}`}>
          <Checkbox checked={selected} onClick={() => onSelect?.(file)} />
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
    </motion.div>
  );
}
