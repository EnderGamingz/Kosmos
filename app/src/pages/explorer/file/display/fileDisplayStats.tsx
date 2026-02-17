import { getFileTypeString } from '@models/file.ts';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { HardDrive, Info } from 'lucide-react';

export function FileDisplayStats({ file }: { file: FileModelDTO }) {
  return (
    <motion.div
      variants={containerVariant(0.06, 0.1)}
      initial={'hidden'}
      animate={'show'}
      exit={'hidden'}
      className={cn(
        'flex flex-wrap gap-1',
        '*:flex *:flex-1 *:items-center *:gap-2 [&_svg]:size-4',
        '*:rounded-full *:px-3 *:py-1',
        '*:text-sm *:bg-border',
      )}
    >
      <motion.div
        layoutId={'fileType-display'}
        variants={itemTransitionVariantFadeInFromTop}
      >
        <Info />
        <motion.span layoutId={'fileType-display-text'}>
          {getFileTypeString(file.file_type)}
        </motion.span>
      </motion.div>
      <motion.div
        layoutId={'fileSize-display'}
        variants={itemTransitionVariantFadeInFromTop}
      >
        <HardDrive />
        <motion.span layoutId={'fileSize-display-text'}>
          {useFormatBytes(file.file_size)}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
