import { FolderModel } from '@models/folder.ts';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import {
  itemTransitionVariant,
  transitionStop,
} from '@components/defaults/transition.ts';
import { motion } from 'framer-motion';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useNavigate } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';

export default function GridFolderItem({
  index,
  folder,
  selected,
  onSelect,
  outerDisabled,
}: {
  index: number;
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
  outerDisabled?: boolean;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );
  const isSelected = selected.includes(folder.id);
  const { setDragDestination, dragDestination, selectedItems } =
    useExplorerStore(
      useShallow(s => ({
        setDragDestination: s.dragMove.setDestination,
        dragDestination: s.dragMove.destination,
        selectedItems: s.selectedResources,
      })),
    );
  const context = useContext(DisplayContext);
  const navigate = useNavigate();

  const moveAction = useMove(
    {
      type: 'folder',
      id: context.dragMove.id as string,
      name: folder.folder_name,
    },
    getMultiMoveBySelected(selectedItems),
    dragDestination,
  );

  const handleFolderClick = () => {
    if (isControl || isShift || disabled) return;
    navigate(
      context.shareUuid
        ? `/s/folder/${context.shareUuid}/${folder.id.toString()}`
        : `/home/folder/${folder.id.toString()}`,
    );
  };

  return (
    <motion.div
      layout
      variants={index < transitionStop ? itemTransitionVariant : undefined}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={'group w-full cursor-pointer'}>
      <motion.div
        onClick={() => {
          if (isControl && !context.viewSettings?.noSelect) onSelect(folder.id);
          else if (isShift && !context.viewSettings?.noSelect)
            context.select.setRange(index);
          else handleFolderClick();
        }}
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
        className={tw(
          'flex items-center',
          'rounded-lg bg-stone-400/40 dark:bg-stone-700/40',
          'shadow-md transition-colors hover:bg-stone-500/40 hover:shadow-lg',
          isSelected && 'bg-indigo-100 dark:bg-indigo-800',
          isShift && 'cursor-pointer',
          context.select.rangeStart === index && 'bg-indigo-50',
        )}>
        <div className={'relative min-h-10 min-w-10'}>
          {!context.viewSettings?.noSelect && (
            <div
              className={tw(
                'absolute inset-0 z-10 grid h-10 w-10 place-items-center opacity-0',
                'transition-opacity group-hover:opacity-100',
                isSelected && 'opacity-100',
              )}>
              <Checkbox
                className={'h-5 w-5 p-0'}
                isSelected={isSelected}
                onValueChange={() => onSelect(folder.id)}
              />
            </div>
          )}
          <div
            className={tw(
              'absolute transition-opacity group-hover:opacity-0',
              isSelected && 'opacity-0',
            )}>
            <ItemIcon
              id={folder.id}
              name={folder.folder_name}
              type={'folder'}
            />
          </div>
        </div>
        <div className={'flex flex-grow items-center'}>
          <span
            className={
              'flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap max-md:min-w-12 md:w-0'
            }>
            {folder.folder_name}
          </span>
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            context.handleContext({ x: e.clientX, y: e.clientY }, folder);
          }}
          className={'cursor-pointer p-2'}>
          <EllipsisVerticalIcon
            className={'h-6 w-6 text-stone-700 dark:text-stone-300'}
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
