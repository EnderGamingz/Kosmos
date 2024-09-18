import { getFileTypeString } from '@models/file.ts';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';
import tw from '@utils/classMerge.ts';
import {
  CircleStackIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useFormatBytes } from '@utils/fileSize.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function FileDisplayStats({ file }: { file: FileModelDTO }) {
  return (
    <motion.div
      variants={containerVariant(0.06, 0.1)}
      initial={'hidden'}
      animate={'show'}
      exit={'hidden'}
      className={tw(
        'flex flex-wrap gap-1',
        '[&>*]:flex [&>*]:flex-1 [&>*]:items-center [&>*]:gap-2 [&_svg]:h-4 [&_svg]:w-4',
        '[&>*]:rounded-full [&>*]:bg-stone-200/70 [&>*]:px-3 [&>*]:py-1',
        '[&>*]:text-sm [&>*]:outline [&>*]:outline-1 [&>*]:outline-stone-600/20',
        'dark:[&>*]:bg-stone-700 dark:[&>*]:text-stone-100 dark:[&>*]:outline-stone-500/20',
      )}>
      <motion.div
        layoutId={'fileType-display'}
        variants={itemTransitionVariantFadeInFromTop}>
        <InformationCircleIcon />
        <motion.span layoutId={'fileType-display-text'}>
          {getFileTypeString(file.file_type)}
        </motion.span>
      </motion.div>
      <motion.div
        layoutId={'fileSize-display'}
        variants={itemTransitionVariantFadeInFromTop}>
        <CircleStackIcon />
        <motion.span layoutId={'fileSize-display-text'}>
          {useFormatBytes(file.file_size)}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
