import { normalizeFileType } from '@models/file.ts';
import { formatDistanceToNow } from 'date-fns';
import { useFormatBytes } from '@utils/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import { type CSSProperties, useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateBin, invalidateUsage } from '@lib/query.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Checkbox } from '@components/ui/checkbox.tsx';
import { EllipsisVertical, RotateCcw, Shredder } from 'lucide-react';
import useSelectFile from '@utils/file.ts';
import ConditionalWrapper from '@components/wrappers/ConditionalWrapper.tsx';

export function BinActions({
  id,
  inList,
  onClose,
}: {
  id: string;
  inList?: boolean;
  onClose?: () => void;
}) {
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

  const onRestore = () => {
    restoreAction.mutate();
    onClose?.();
  };

  const onDelete = () => {
    deleteAction.mutate();
    onClose?.();
  };

  return (
    <ConditionalWrapper
      wrapper={c => (
        <div className={'flex items-center gap-5 [&_svg]:h-5 [&_svg]:w-5'}>
          {c}
        </div>
      )}
      condition={!inList}
    >
      <button
        type={'button'}
        title={'Restore'}
        className={'text-blue-500'}
        onClick={onRestore}
      >
        <RotateCcw />
        {inList && 'Restore File'}
      </button>
      <button
        type={'button'}
        title={'Delete'}
        className={'text-red-500'}
        onClick={onDelete}
      >
        <Shredder />
        {inList && 'Delete permanently'}
      </button>
    </ConditionalWrapper>
  );
}

export function TableFileItem({
  i,
  file,
  selected,
  onSelect,
  style,
}: {
  i: number;
  file: FileModelDTO;
  selected: string[];
  onSelect: (file: FileModelDTO) => void;
  outerDisabled?: boolean;
  style?: CSSProperties;
}) {
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );

  const selectFile = useSelectFile();

  const isSelected = selected.includes(file.id);

  const context = useContext(DisplayContext);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onClick and onContextMenu events.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with potential keyboard shortcuts for file selection and context menu actions.
    <div
      style={style}
      id={file.id}
      onClick={() => {
        if (isControl) onSelect(file);
        if (isShift) context.select.setRange(i);
      }}
      onContextMenu={e => {
        e.stopPropagation();
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={cn(
        'flex items-center group transition-colors hover:bg-border [&>div]:p-3',
        isSelected &&
          'bg-indigo-100 dark:bg-indigo-700/50 hover:bg-indigo-200 dark:hover:bg-indigo-600/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i &&
          'bg-indigo-50 dark:bg-indigo-600/60 hover:bg-indigo-100 dark:hover:bg-indigo-700/60',
      )}
    >
      {!context.viewSettings?.noSelect && (
        <div>
          <Checkbox checked={isSelected} onClick={() => onSelect(file)} />
        </div>
      )}
      <div
        className={cn(
          'flex h-full p-0! grow',
          !!context.viewSettings?.noSelect && 'pl-3!',
        )}
      >
        <button
          type={'button'}
          className={'flex grow items-center text-start'}
          onClick={() => {
            if (isControl || isShift || context.viewSettings?.noDisplay) return;
            selectFile(file.id);
          }}
        >
          <ItemIcon
            id={file.id}
            name={file.file_name}
            type={normalizeFileType(file.file_type)}
            status={file.preview_status}
          />
          <p
            className={
              'w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap p-3'
            }
          >
            {file.file_name}
          </p>
        </button>
        {!context.viewSettings?.binView && (
          <Favorite
            id={file.id}
            type={'file'}
            iconOnly
            active={file.favorite}
          />
        )}
        <button
          type={'button'}
          onClick={e => {
            context.handleContext({ x: e.clientX, y: e.clientY }, file);
          }}
          className={'p-2'}
        >
          <EllipsisVertical className={'h-5 w-5'} />
        </button>
      </div>
      <div className={'text-right w-[110px]'}>
        {useFormatBytes(file.file_size)}
      </div>
      <div
        className={'whitespace-nowrap text-sm font-light text-right w-[155px]'}
      >
        {formatDistanceToNow(file.updated_at)}
      </div>
      {context.viewSettings?.binView && (
        <div>
          <BinActions id={file.id} />
        </div>
      )}
    </div>
  );
}
