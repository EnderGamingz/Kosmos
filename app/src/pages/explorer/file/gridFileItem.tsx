import { FileTypeActions, normalizeFileType } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { FileTypeDisplay } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { useFormatBytes } from '@utils/fileSize.ts';
import { formatDistanceToNow } from 'date-fns';
import { DetailType } from '@stores/preferenceStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Checkbox } from '@components/ui/checkbox.tsx';
import { Clock, EllipsisVertical } from 'lucide-react';
import useSelectFile from '@utils/file.ts';

export default function GridFileItem({
  index,
  file,
  selected,
  onSelect,
  dynamic,
  details,
  outerDisabled,
}: {
  index: number;
  file: FileModelDTO;
  selected?: string[];
  onSelect?: (file: FileModelDTO) => void;
  dynamic?: boolean;
  details: DetailType;
  outerDisabled?: boolean;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );

  const isSelected = selected?.includes(file.id);
  const fileHasPreview = FileTypeActions.hasPreview(file);
  const isDynamic = dynamic && fileHasPreview;

  const isDefaultDisplay = details === DetailType.Default;
  const isCompact = details === DetailType.Compact;
  const isHidden = details === DetailType.Hidden;

  const selectFile = useSelectFile();

  const { dragDestination, setDestination, selectedItems } = useExplorerStore(
    useShallow(s => ({
      dragDestination: s.dragMove.destination,
      setDestination: s.dragMove.setDestination,
      selectedItems: s.selectedResources,
    })),
  );
  const context = useContext(DisplayContext);

  const handleClick = () => {
    if (disabled) return;
    if (isControl && !context.viewSettings?.noSelect) onSelect?.(file);
    else if (isShift && !context.viewSettings?.noSelect)
      context.select.setRange(index);
    else if (!context.viewSettings?.noDisplay) selectFile(file.id);
  };

  const moveAction = useMove(
    {
      type: 'file',
      id: context.dragMove.id as string,
      name: file.file_name,
    },
    getMultiMoveBySelected(selectedItems),
    dragDestination,
  );

  const formattedSize = useFormatBytes(file.file_size);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onClick and onContextMenu events.
    <div
      id={file.id}
      onContextMenu={e => {
        e.stopPropagation();
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={cn(
        'group relative rounded-lg',
        'transition-all',
        isSelected &&
          'bg-indigo-100/50 ring-offset-1 ring-2 ring-indigo-500 dark:ring-indigo-300',
        isShift && 'cursor-pointer',
        context.select.rangeStart === index &&
          'bg-indigo-50 dark:bg-indigo-900/50',
        dynamic && 'w-full',
      )}
    >
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
      >
        <div
          className={cn(
            'absolute z-30 flex items-center gap-2 px-2 py-1.5 ',
            '[&>button>svg]:w-5 [&>button]:-mt-0.5 [&>button]:p-0',
            'left-1 top-1 overflow-hidden rounded-t-lg',
            isDefaultDisplay &&
              'gap-2 pl-1.5 pt-2.5 [&>button>svg]:w-6 [&>button]:-mt-1',
            isHidden && 'left-0 top-0',
          )}
        >
          {!context.viewSettings?.noSelect && onSelect && (
            <Checkbox
              className={'h-4 w-4 bg-border'}
              checked={isSelected}
              onClick={() => onSelect(file)}
            />
          )}
          <Favorite
            id={file.id}
            type={'file'}
            active={file.favorite}
            iconOnly
            white
          />
        </div>
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with drag-and-drop interactions. */}
        {/** biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onClick and onContextMenu events. */}
        <div
          onClick={handleClick}
          className={cn(
            'relative h-32',
            isDefaultDisplay && 'm-1.5 mb-0',
            fileHasPreview
              ? 'rounded-lg [&_.img-container]:h-32 [&_img]:aspect-auto [&_img]:h-[inherit] [&_img]:w-full'
              : isCompact
                ? '[&>div]:p-0 [&_svg]:h-12 [&_svg]:w-12'
                : '[&>div]:p-0 [&_svg]:h-14 [&_svg]:w-14',
            isDynamic ? 'h-auto [&_.img-container]:h-auto [&_img]:h-full' : '',
          )}
        >
          {fileHasPreview ? (
            <ItemIcon
              id={file.id}
              name={file.file_name}
              type={normalizeFileType(file.file_type)}
              status={file.preview_status}
              dynamic
            />
          ) : (
            <FileTypeDisplay
              id={file.id}
              name={file.file_name}
              type={file.file_type}
              noText
            />
          )}
          {!isHidden && (
            <p
              key={`size-${file.id}`}
              className='absolute right-1.5 top-1.5 z-30 rounded-full bg-border px-1.5! py-0.5! text-xs'
            >
              {formattedSize}
            </p>
          )}
          {isCompact && (
            <div
              key={`compact-${file.id}`}
              className={cn(
                'absolute inset-0 z-20 flex rounded-lg px-1.5! py-1!',
                'bg-linear-to-t from-stone-800/70 to-stone-800/0',
              )}
            >
              <button
                type={'button'}
                onClick={handleClick}
                key={`title-${file.id}`}
                className={cn(
                  'text-start w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                  'mt-auto text-sm text-stone-50',
                  !isCompact && 'lg:text-base',
                )}
              >
                {file.file_name}
              </button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {isDefaultDisplay && (
            <div className={'px-2 py-1'}>
              <div className={'flex items-center'}>
                {/** biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interactions are intentionally not implemented for this element to avoid conflicts with drag-and-drop interactions. */}
                <p
                  onClick={handleClick}
                  className={cn(
                    'w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                    'text-sm',
                    !isCompact && 'lg:text-base',
                  )}
                >
                  {file.file_name}
                </p>
                <button
                  type={'button'}
                  onClick={e => {
                    context.handleContext({ x: e.clientX, y: e.clientY }, file);
                  }}
                >
                  <EllipsisVertical className={'h-5 w-5'} />
                </button>
              </div>
              <p
                key={`updated-${file.updated_at}`}
                className={
                  'flex items-center gap-1 whitespace-nowrap text-xs font-light text-muted-foreground'
                }
              >
                <Clock className={'h-3 w-3'} />{' '}
                {formatDistanceToNow(file.updated_at)} ago
              </p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
