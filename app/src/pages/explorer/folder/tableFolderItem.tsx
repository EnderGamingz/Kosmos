import { FolderModel } from '@models/folder.ts';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@utils/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { motion } from 'framer-motion';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';

export function TableFolderItem({
  i,
  folder,
  selected,
  onSelect,
  outerDisabled,
}: {
  i: number;
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
  outerDisabled?: boolean;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({ isControl: s.keys.ctrl, isShift: s.keys.shift })),
  );
  const { setDragDestination, dragDestination, selectedItems } =
    useExplorerStore(
      useShallow(s => ({
        setDragDestination: s.dragMove.setDestination,
        dragDestination: s.dragMove.destination,
        selectedItems: s.selectedResources,
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
    getMultiMoveBySelected(selectedItems),
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
    <tr
      onClick={() => {
        if (isControl) onSelect(folder.id);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={tw(
        'group transition-colors [&_td]:p-3 [&_th]:p-3',
        'hover:bg-stone-500/10 hover:shadow-sm',
        isSelected && 'bg-indigo-100 dark:bg-indigo-700/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i && 'bg-indigo-50 dark:bg-indigo-600/60',
      )}>
      {!context.viewSettings?.noSelect && (
        <th>
          <Checkbox
            isSelected={isSelected}
            onValueChange={() => onSelect(folder.id)}
          />
        </th>
      )}
      <td className={'!p-0'}>
        <div className={'flex w-full items-center'}>
          <motion.div
            onClick={handleFolderClick}
            drag={
              !outerDisabled &&
              !context.viewSettings?.limitedView &&
              !isTouchDevice()
            }
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
              color={folder.color}
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
          {!context.viewSettings?.scrollControlMissing && (
            <button
              onClick={e => {
                context.handleContext({ x: e.clientX, y: e.clientY }, folder);
              }}
              className={'cursor-pointer p-2'}>
              <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
            </button>
          )}
        </div>
      </td>
      <td align={'right'}></td>
      <td align={'right'} className={'whitespace-nowrap text-sm font-light'}>
        {formatDistanceToNow(folder.updated_at)}
      </td>
    </tr>
  );
}
