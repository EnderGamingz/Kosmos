import { FileModel } from '@models/file.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import { MoveToTrash } from '@pages/explorer/components/delete';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromLeft,
} from '@components/transition.ts';
import tw from '@lib/classMerge.ts';

export function FileDisplayAction({
  file,
  onClose,
}: {
  file: FileModel;
  onClose: () => void;
}) {
  const actions = [
    <DownloadSingleAction type={'file'} id={file.id} name={file.file_name} />,
    <RenameAction
      type={'file'}
      id={file.id}
      name={file.file_name}
      onClose={onClose}
    />,
    <MoveAction
      type={'file'}
      name={file.file_name}
      id={file.id}
      current_parent={file.parent_folder_id}
      onClose={onClose}
    />,
    <MoveToTrash short id={file.id} name={file.file_name} onClose={onClose} />,
  ];
  return (
    <motion.div
      variants={containerVariant(0.08, 0.1)}
      initial={'hidden'}
      animate={'show'}
      exit={'hidden'}
      className={tw(
        'flex flex-wrap justify-center gap-2',
        '[&_button>svg]:h-10 [&_button>svg]:w-10 [&_button]:rounded-xl [&_button]:p-2',
        '[&_button]:grid [&_button]:place-items-center',
        '[&_button]:bg-stone-200/20 [&_button]:outline [&_button]:outline-1 [&_button]:outline-stone-400/10',
        '[&_button]:h-24 [&_button]:w-24  [&_button]:shadow-md [&_button]:transition-all',
        '[&_button:hover]:bg-stone-400/20 [&_button:hover]:shadow-xl',
      )}>
      {actions.map((item, i) => (
        <motion.div
          key={`file-display-action-${i}`}
          variants={itemTransitionVariantFadeInFromLeft}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
