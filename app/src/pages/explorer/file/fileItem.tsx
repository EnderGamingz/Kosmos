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
  fileItemTransitionVariant,
  transitionStop,
} from '@pages/explorer/components/transition.ts';

export function FileItem({
  file,
  selected,
  onSelect,
  onContext,
  i,
}: {
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
  onContext: (file: FileModel, pos: { x: number; y: number }) => void;
  i: number;
}) {
  const isControl = useKeyStore(s => s.ctrl);
  const isSelected = selected.includes(file.id);

  return (
    <motion.tr
      variants={i < transitionStop ? fileItemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(file.id);
      }}
      onContextMenu={e => {
        e.preventDefault();
        onContext(file, {
          x: e.clientX,
          y: e.clientY,
        });
      }}
      className={tw(
        'group transition-colors [&_td]:p-2 [&_th]:p-2',
        isSelected && 'bg-indigo-100',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
        />
      </th>
      <td className={'!p-0'}>
        <div className={'flex'}>
          <ItemIcon
            name={file.file_name}
            type={normalizeFileType(file.file_type)}
            id={file.id}
          />
          <p
            className={
              'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
            }>
            {file.file_name}
          </p>
          <button
            onClick={e => {
              onContext(file, {
                x: e.clientX,
                y: e.clientY,
              });
            }}
            className={'cursor-pointer p-2'}>
            <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
          </button>
        </div>
      </td>
      <td align={'right'}>{formatBytes(file.file_size)}</td>
      <td
        align={'right'}
        className={'whitespace-nowrap text-sm font-light lg:text-base'}>
        {formatDistanceToNow(file.updated_at)}
      </td>
    </motion.tr>
  );
}
