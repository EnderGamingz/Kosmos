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
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@lib/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';

export function TableFileItem({
  i,
  fileIndex,
  file,
  selected,
  onSelect,
}: {
  i: number;
  fileIndex: number;
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );

  const { selectFile, dragDestination, setDestination } = useExplorerStore(
    useShallow(s => ({
      selectFile: s.current.selectCurrentFile,
      dragDestination: s.dragMove.destination,
      setDestination: s.dragMove.setDestination,
    })),
  );

  const isSelected = selected.includes(file.id);

  const context = useContext(DisplayContext);

  const moveAction = useMove(
    {
      type: 'file',
      id: context.dragMove.id as string,
      name: file.file_name,
    },
    dragDestination,
  );

  return (
    <motion.tr
      layout
      variants={i < transitionStop ? itemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(file.id);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group transition-all [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100',
        isShift && 'cursor-pointer hover:scale-95',
        context.select.rangeStart === i && 'scale-95 bg-indigo-50',
      )}>
      <motion.th layoutId={`check-${file.id}`}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
        />
      </motion.th>
      <td className={'flex !p-0'}>
        <motion.div
          drag={!context.recentView && !isTouchDevice()}
          dragSnapToOrigin
          whileDrag={{ scale: 0.6, pointerEvents: 'none', opacity: 0.5 }}
          onDragStart={() => {
            setDestination();
            context.dragMove.setDrag('file', file.id);
            setDisabled(true);
          }}
          onDragEnd={() => {
            if (dragDestination) {
              moveAction.mutate();
            }
          }}
          onDragTransitionEnd={() => {
            context.dragMove.resetDrag();
            setDestination();
            setDisabled(false);
          }}
          className={'flex flex-grow items-center'}
          onClick={() => {
            if (isControl || isShift || disabled) return;
            selectFile(fileIndex);
          }}>
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
        </motion.div>
        <Favorite id={file.id} type={'file'} iconOnly active={file.favorite} />
        <button
          onClick={e => {
            context.handleContext({ x: e.clientX, y: e.clientY }, file);
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
