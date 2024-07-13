import { FileModel, getFileTypeString } from '@models/file.ts';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';
import tw from '@lib/classMerge.ts';
import {
  CircleStackIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatBytes } from '@lib/fileSize.ts';

export function FileDisplayStats({ file }: { file: FileModel }) {
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
      )}>
      <motion.div variants={itemTransitionVariantFadeInFromTop}>
        <InformationCircleIcon />
        {getFileTypeString(file.file_type)}
      </motion.div>
      <motion.div variants={itemTransitionVariantFadeInFromTop}>
        <CircleStackIcon />
        <motion.span layoutId={`size-${file.id}`}>
          {formatBytes(file.file_size)}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
