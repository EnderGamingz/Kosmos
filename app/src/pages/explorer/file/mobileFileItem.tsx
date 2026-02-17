import { normalizeFileType } from '@models/file.ts';
import { formatDistanceToNow } from 'date-fns';
import { useFormatBytes } from '@utils/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import { type CSSProperties, useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import useSelectFile from '@utils/file.ts';
import { Check, EllipsisVertical, Star } from 'lucide-react';

export function MobileFileItem({
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with mobile touch interactions.
    <div
      style={style}
      id={file.id}
      onClick={() => {
        if (isControl) onSelect(file);
        if (isShift) context.select.setRange(i);
        if (!isControl && !isShift && !context.viewSettings?.noDisplay)
          selectFile(file.id);
      }}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        if (!context.viewSettings?.noSelect) onSelect(file);
      }}
      className={cn(
        'flex items-center group transition-colors p-3 gap-2 rounded-lg hover:bg-border',
        isSelected &&
          'bg-indigo-100 dark:bg-indigo-700/50 hover:bg-indigo-200 dark:hover:bg-indigo-600/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i && 'bg-indigo-50 dark:bg-indigo-600/60',
      )}
    >
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with mobile touch interactions. */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onClick and onContextMenu events. */}
      <div
        onClick={e => {
          e.stopPropagation();
          if (!context.viewSettings?.noSelect) onSelect(file);
        }}
        className={'relative'}
      >
        <div
          className={cn('rounded-lg', isSelected && 'bg-popover brightness-50')}
        >
          <ItemIcon
            id={file.id}
            name={file.file_name}
            type={normalizeFileType(file.file_type)}
            status={file.preview_status}
          />
        </div>
        {!context.viewSettings?.noSelect && (
          <Check
            className={cn(
              'w-7 h-7 transition-opacity text-white absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-10',
              !isSelected ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}
      </div>
      <div className={'flex flex-col overflow-hidden'}>
        <p className={'truncate'}>{file.file_name}</p>
        <p
          className={
            'flex gap-1 flex-wrap text-xs text-muted-foreground items-center'
          }
        >
          {file.favorite && (
            <>
              <Star className={'w-3.5 h-3.5'} /> &bull;{' '}
            </>
          )}
          Modified {formatDistanceToNow(file.updated_at)} &bull;{' '}
          {useFormatBytes(file.file_size)}
        </p>
      </div>
      <button
        type={'button'}
        className={'p-2 cursor-pointer ml-auto'}
        onClick={e => {
          e.stopPropagation();
          context.handleContext({ x: e.clientX, y: e.clientY }, file);
        }}
      >
        <EllipsisVertical className={'w-5 h-5'} />
      </button>
    </div>
  );
}
