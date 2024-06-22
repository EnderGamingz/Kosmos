import { FileModel, normalizeFileType } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@lib/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import {
  itemTransitionVariant,
  transitionStop,
} from '@components/transition.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

export function FileItem({
  i,
  file,
  selected,
  onSelect,
}: {
  i: number;
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const isControl = useKeyStore(s => s.ctrl);
  const isSelected = selected.includes(file.id);

  const selectFile = useExplorerStore(s => s.current.selectCurrentFile);
  const contextMenu = useContext(DisplayContext);

  return (
    <motion.tr
      layoutId={`file-${file.id}`}
      layout
      variants={i < transitionStop ? itemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(file.id);
      }}
      onContextMenu={e => {
        e.preventDefault();
        contextMenu.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group transition-colors [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100',
      )}>
      <motion.th layoutId={`check-${file.id}`}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
        />
      </motion.th>
      <td className={'flex !p-0'}>
        <div
          className={'flex flex-grow items-center'}
          onClick={() => selectFile(file)}>
          <ItemIcon
            id={file.id}
            name={file.file_name}
            type={normalizeFileType(file.file_type)}
            status={file.preview_status}
          />
          <motion.p
            exit={{ opacity: 0 }}
            layoutId={`title-${file.id}`}
            className={
              'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
            }>
            {file.file_name}
          </motion.p>
        </div>
        <button
          onClick={e => {
            contextMenu.handleContext({ x: e.clientX, y: e.clientY }, file);
          }}
          className={'cursor-pointer p-2'}>
          <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
        </button>
      </td>
      <motion.td layoutId={`size-${file.id}`} align={'right'}>
        {formatBytes(file.file_size)}
      </motion.td>
      <motion.td
        layoutId={`updated-${file.id}`}
        align={'right'}
        className={'whitespace-nowrap text-sm font-light lg:text-base'}>
        {formatDistanceToNow(file.updated_at)}
      </motion.td>
    </motion.tr>
  );
}
