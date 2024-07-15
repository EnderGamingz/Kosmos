import { FolderModel } from '@models/folder.ts';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@lib/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { motion } from 'framer-motion';

import {
  itemTransitionVariant,
  transitionStop,
} from '@components/defaults/transition.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@lib/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';

export function TableFolderItem({
  i,
  folder,
  selected,
  onSelect,
}: {
  i: number;
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({ isControl: s.keys.ctrl, isShift: s.keys.shift })),
  );
  const { setDragDestination, dragDestination } = useExplorerStore(
    useShallow(s => ({
      setDragDestination: s.dragMove.setDestination,
      dragDestination: s.dragMove.destination,
    })),
  );
  const isSelected = selected.includes(folder.id);
  const context = useContext(DisplayContext);

  const moveAction = useMove(
    {
      type: 'folder',
      id: context.dragMove.id as string,
      name: folder.folder_name,
    },
    dragDestination,
  );

  const navigate = useNavigate();

  const handleFolderClick = () => {
    if (isControl || isShift) return;
    navigate(
      context.shareUuid
        ? `/s/folder/${context.shareUuid}/${folder.id.toString()}`
        : `/home/folder/${folder.id.toString()}`,
    );
  };

  return (
    <motion.tr
      layout
      variants={i < transitionStop ? itemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(folder.id);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={tw(
        'group transition-all [&_td]:p-3 [&_th]:p-3',
        'hover:bg-stone-500/10 hover:shadow-sm',
        isSelected && 'bg-indigo-100',
        isShift && 'cursor-pointer hover:scale-95',
        context.select.rangeStart === i && 'scale-95 bg-indigo-50',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(folder.id)}
        />
      </th>
      <td className={'!p-0'}>
        <div className={'flex w-full items-center'}>
          <motion.div
            onClick={handleFolderClick}
            drag={!context.viewSettings?.limitedView && !isTouchDevice()}
            dragSnapToOrigin
            whileDrag={{ scale: 0.6, pointerEvents: 'none', opacity: 0.5 }}
            onDragStart={() => {
              setDragDestination();
              context.dragMove.setDrag('folder', folder.id);
              setDisabled(true);
            }}
            onDragEnd={() => {
              if (dragDestination) {
                moveAction.mutate();
              }
            }}
            onDragTransitionEnd={() => {
              context.dragMove.resetDrag();
              setDragDestination();
              setDisabled(false);
            }}
            onMouseEnter={() => {
              if (!disabled) setDragDestination(folder.id);
            }}
            onMouseLeave={() => {
              if (!disabled) setDragDestination();
            }}
            className={'flex w-full cursor-pointer items-center'}>
            <ItemIcon
              id={folder.id}
              name={folder.folder_name}
              type={'folder'}
            />
            <span
              className={
                'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
              }>
              {folder.folder_name}
            </span>
          </motion.div>
          <Favorite
            id={folder.id}
            type={'folder'}
            active={folder.favorite}
            iconOnly
          />
          <button
            onClick={e => {
              context.handleContext({ x: e.clientX, y: e.clientY }, folder);
            }}
            className={'cursor-pointer p-2'}>
            <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
          </button>
        </div>
      </td>
      <td align={'right'}></td>
      <td align={'right'} className={'whitespace-nowrap text-sm font-light'}>
        {formatDistanceToNow(folder.updated_at)}
      </td>
    </motion.tr>
  );
}
