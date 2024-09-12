import { getFileTypeString } from '@models/file.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import tw from '@utils/classMerge.ts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTopSmall,
} from '@components/defaults/transition.ts';
import { FileTypeSumDataDTO } from '@bindings/FileTypeSumDataDTO.ts';

export function UsageReportByType({ types }: { types: FileTypeSumDataDTO[] }) {
  return (
    <section className={'space-y-2'}>
      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.4 }}
        className={'text-xl font-semibold text-stone-700 dark:text-stone-300'}>
        Storage used by type
      </motion.h2>
      <motion.div
        variants={containerVariant(0.02, 0.5)}
        initial={'hidden'}
        animate={'show'}
        className={
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
        }>
        {types.map(type => (
          <FileTypeUsageItem key={type.file_type} type={type} />
        ))}
      </motion.div>
    </section>
  );
}

function FileTypeUsageItem({ type }: { type: FileTypeSumDataDTO }) {
  const fileTypeString = getFileTypeString(type.file_type);
  const navigate = useNavigate();
  return (
    <motion.div
      variants={itemTransitionVariantFadeInFromTopSmall}
      onClick={() => navigate(`/home/files/${type.file_type}`)}
      className={tw(
        'overflow-hidden rounded-xl bg-stone-300/40 p-2 text-stone-700',
        'cursor-pointer transition-colors hover:bg-stone-400/40',
        'outline outline-1 outline-stone-400/20',
        'dark:bg-stone-600/40 dark:text-stone-300 dark:hover:bg-stone-700/40',
      )}>
      <p
        title={fileTypeString}
        className={'truncate whitespace-nowrap text-lg'}>
        {fileTypeString}
      </p>
      <p className={'font-semibold'}>{useFormatBytes(type.sum)}</p>
      <p className={'text-sm'}>{type.count} Files</p>
    </motion.div>
  );
}
