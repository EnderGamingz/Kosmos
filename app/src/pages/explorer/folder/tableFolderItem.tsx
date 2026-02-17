import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useKeyStore } from '@stores/keyStore.ts';
import { motion } from 'framer-motion';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { type CSSProperties, useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Checkbox } from '@components/ui/checkbox.tsx';
import { EllipsisVertical } from 'lucide-react';

export function TableFolderItem({
  i,
  folder,
  selected,
  onSelect,
  outerDisabled,
  style,
}: {
  i: number;
  folder: FolderModelDTO;
  selected: string[];
  onSelect: (folder: FolderModelDTO) => void;
  outerDisabled?: boolean;
  style?: CSSProperties;
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
    if (context.viewSettings?.handleOverwrites?.onFolderClick) {
      context.viewSettings?.handleOverwrites?.onFolderClick(
        folder.id.toString(),
      );
      return;
    }
    navigate(
      context.shareUuid
        ? `/s/folder/${context.shareUuid}/${folder.id.toString()}`
        : `/home/folder/${folder.id.toString()}`,
    );
  };

  const selectDisabled = context.viewSettings?.selectDisable?.folders;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onClick and onContextMenu events.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with mobile touch interactions.
    <div
      style={style}
      onClick={() => {
        if (isControl && !selectDisabled) onSelect(folder);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.stopPropagation();
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={cn(
        'flex items-center group/listItem group transition-colors hover:bg-border [&>div]:p-3',
        isSelected &&
          'bg-indigo-100 dark:bg-indigo-700/50 hover:bg-indigo-200 dark:hover:bg-indigo-600/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i &&
          'bg-indigo-50 dark:bg-indigo-600/60 hover:bg-indigo-100 dark:hover:bg-indigo-700/60',
      )}
    >
      {!context.viewSettings?.noSelect && (
        <div>
          <Checkbox
            checked={isSelected}
            onClick={() => !selectDisabled && onSelect(folder)}
          />
        </div>
      )}
      <div className={'p-0! grow'}>
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
            className={'flex w-full cursor-pointer items-center'}
          >
            <ItemIcon
              id={folder.id}
              name={folder.folder_name}
              type={'folder'}
              color={folder.color}
            />
            <span
              className={
                'w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
              }
            >
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
            type={'button'}
            onClick={e => {
              context.handleContext({ x: e.clientX, y: e.clientY }, folder);
            }}
            className={'p-2'}
          >
            <EllipsisVertical className={'h-5 w-5'} />
          </button>
        </div>
      </div>
      <div className={'text-right w-[110px]'}></div>
      <div
        className={'whitespace-nowrap text-sm font-light text-right w-[155px]'}
      >
        {formatDistanceToNow(folder.updated_at)}
      </div>
    </div>
  );
}
