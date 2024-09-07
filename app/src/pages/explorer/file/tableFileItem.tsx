import { FileModel, normalizeFileType } from '@models/file.ts';
import tw from '@utils/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { useFormatBytes } from '@utils/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import {
  ArrowPathIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateBin, invalidateUsage } from '@lib/query.ts';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';

function TableFileItemBinActions({ id }: { id: string }) {
  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/file/${id}`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

  const restoreAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/${id}/restore`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

  return (
    <div className={'flex items-center gap-5'}>
      <button
        title={'Restore'}
        className={'text-blue-500'}
        onClick={() => restoreAction.mutate()}>
        <ArrowPathIcon className={'h-5 w-5'} />
      </button>
      <button
        title={'Delete'}
        className={'text-red-500'}
        onClick={() => deleteAction.mutate()}>
        <TrashIcon className={'h-5 w-5'} />
      </button>
    </div>
  );
}

export function TableFileItem({
  i,
  fileIndex,
  file,
  selected,
  onSelect,
  outerDisabled,
}: {
  i: number;
  fileIndex: number;
  file: FileModel;
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

  const { selectFile, dragDestination, setDestination, selectedItems } =
    useExplorerStore(
      useShallow(s => ({
        selectFile: s.current.selectCurrentFile,
        dragDestination: s.dragMove.destination,
        setDestination: s.dragMove.setDestination,
        selectedItems: s.selectedResources,
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
    getMultiMoveBySelected(selectedItems),
    dragDestination,
  );

  return (
    <tr
      id={file.id}
      onClick={() => {
        if (isControl) onSelect(file.id);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group transition-colors [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100 dark:bg-indigo-700/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i && 'bg-indigo-50 dark:bg-indigo-600/60',
      )}>
      {!context.viewSettings?.noSelect && (
        <motion.th /*layoutId={`check-${file.id}`}*/>
          <Checkbox
            isSelected={isSelected}
            onValueChange={() => onSelect(file.id)}
          />
        </motion.th>
      )}
      <td
        className={tw(
          'flex !p-0',
          !!context.viewSettings?.noSelect && '!pl-3',
        )}>
        <motion.div
          drag={
            !outerDisabled &&
            !context.viewSettings?.limitedView &&
            !isTouchDevice() &&
            !context.shareUuid
          }
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
            if (
              isControl ||
              isShift ||
              disabled ||
              context.viewSettings?.noDisplay
            )
              return;
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
            className={
              'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
            }>
            {file.file_name}
          </motion.p>
        </motion.div>
        {!context.viewSettings?.binView && (
          <Favorite
            id={file.id}
            type={'file'}
            iconOnly
            active={file.favorite}
          />
        )}
        {!context.viewSettings?.scrollControlMissing && (
          <button
            onClick={e => {
              context.handleContext({ x: e.clientX, y: e.clientY }, file);
            }}
            className={'cursor-pointer p-2'}>
            <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
          </button>
        )}
      </td>
      <motion.td
        /*layoutId={`size-${file.id}`}*/
        align={'right'}>
        {useFormatBytes(file.file_size)}
      </motion.td>
      <motion.td
        /*layoutId={`updated-${file.id}`}*/
        align={'right'}
        className={'whitespace-nowrap text-sm font-light'}>
        {formatDistanceToNow(file.updated_at)}
      </motion.td>
      {context.viewSettings?.binView && (
        <td>
          <TableFileItemBinActions id={file.id} />
        </td>
      )}
    </tr>
  );
}
