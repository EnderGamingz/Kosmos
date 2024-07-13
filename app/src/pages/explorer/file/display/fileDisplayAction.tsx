import { fileCanOpenExternal, FileModel } from '@models/file.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import { MoveToTrash } from '@pages/explorer/components/delete';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromLeft,
} from '@components/defaults/transition.ts';
import tw from '@lib/classMerge.ts';
import OpenExternally from '@pages/explorer/components/openExternally.tsx';
import { ReactNode } from 'react';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { BASE_URL } from '@lib/vars.ts';

const actions = (file: FileModel, onClose?: () => void, shareUuid?: string) => {
  return [
    <DownloadSingleAction
      type={'file'}
      id={file.id}
      name={file.file_name}
      shareUuid={shareUuid}
    />,
    fileCanOpenExternal(file) && (
      <OpenExternally
        id={file.id}
        overwriteUrl={
          shareUuid && `${BASE_URL}s/file/${shareUuid}/action/Serve`
        }
      />
    ),
    !shareUuid && (
      <RenameAction
        type={'file'}
        id={file.id}
        name={file.file_name}
        onClose={onClose}
      />
    ),
    !shareUuid && (
      <MoveAction
        type={'file'}
        name={file.file_name}
        id={file.id}
        current_parent={file.parent_folder_id}
        onClose={onClose}
      />
    ),
    !shareUuid && (
      <MoveToTrash short id={file.id} name={file.file_name} onClose={onClose} />
    ),
    !shareUuid && <ShareButton id={file.id} type={'file'} onClose={onClose} />,
  ].filter(Boolean) as ReactNode[];
};

export function FileDisplayAction({
  file,
  onClose,
  shareUuid,
  left,
}: {
  file: FileModel;
  onClose?: () => void;
  shareUuid?: string;
  left?: boolean;
}) {
  const items = actions(file, onClose, shareUuid);
  return (
    <motion.div
      variants={containerVariant(0.08, 0.2)}
      initial={'hidden'}
      animate={'show'}
      exit={'hidden'}
      className={tw(
        '!my-5 flex flex-wrap gap-4',
        !left && 'justify-center',
        '[&_button>svg]:h-8 [&_button>svg]:w-8 [&_button]:rounded-xl [&_button]:p-2',
        '[&_button]:grid [&_button]:place-items-center',
        '[&_button]:bg-stone-200/20 [&_button]:outline [&_button]:outline-1 [&_button]:outline-stone-400/10',
        '[&_button]:h-20 [&_button]:w-20 [&_button]:text-sm [&_button]:shadow-sm [&_button]:transition-all',
        '[&_button:hover]:bg-stone-400/20 [&_button:hover]:shadow-md',
      )}>
      {items.map((item, i) => (
        <motion.div
          key={`file-display-action-${i}`}
          variants={itemTransitionVariantFadeInFromLeft}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
