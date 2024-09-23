import { FileTypeActions, normalizeFileType } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { Checkbox } from '@nextui-org/react';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import tw from '@utils/classMerge.ts';
import { FileTypeDisplay } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { useFormatBytes } from '@utils/fileSize.ts';
import { ClockIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { DetailType } from '@stores/preferenceStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export default function GridFileItem({
  index,
  fileIndex,
  file,
  selected,
  onSelect,
  dynamic,
  details,
  outerDisabled,
}: {
  index: number;
  fileIndex: number;
  file: FileModelDTO;
  selected?: string[];
  onSelect?: (id: string) => void;
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

  const { selectFile, dragDestination, setDestination, selectedItems } =
    useExplorerStore(
      useShallow(s => ({
        selectFile: s.current.selectCurrentFile,
        dragDestination: s.dragMove.destination,
        setDestination: s.dragMove.setDestination,
        selectedItems: s.selectedResources,
      })),
    );
  const context = useContext(DisplayContext);

  const handleClick = () => {
    if (disabled) return;
    if (isControl && !context.viewSettings?.noSelect) onSelect?.(file.id);
    else if (isShift && !context.viewSettings?.noSelect)
      context.select.setRange(index);
    else if (!context.viewSettings?.noDisplay) selectFile(fileIndex);
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
    <div
      id={file.id}
      onContextMenu={e => {
        e.stopPropagation();
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group relative rounded-lg outline outline-2 ',
        'outline-transparent transition-[outline-color]',
        Boolean(isSelected) &&
          'bg-indigo-100/50 outline-indigo-300 dark:bg-indigo-900/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === index &&
          'bg-indigo-50 dark:bg-indigo-900/50',
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
        }}>
        <div
          className={tw(
            'absolute z-30 flex items-start gap-2 px-2 py-1.5',
            '[&>button>svg]:w-5 [&>button]:-mt-0.5 [&>button]:p-0',
            'left-1.5 top-1.5 h-20 overflow-hidden rounded-t-lg',
            isDefaultDisplay &&
              'gap-3 pl-1.5 pt-2.5 [&>button>svg]:w-6 [&>button]:-mt-1',
            isHidden && 'left-0 top-0',
          )}>
          {!context.viewSettings?.noSelect && onSelect && (
            <div className={'-mt-1 h-4 w-4'}>
              <Checkbox
                className={'h-4 w-4'}
                isSelected={isSelected}
                onValueChange={() => onSelect(file.id)}
                classNames={{ wrapper: 'backdrop-blur-md' }}
                size={isDefaultDisplay ? 'md' : 'sm'}
              />
            </div>
          )}
          <Favorite
            id={file.id}
            type={'file'}
            active={file.favorite}
            iconOnly
            white
          />
        </div>
        <div
          onClick={handleClick}
          className={tw(
            'relative h-32',
            isDefaultDisplay && 'm-1.5 mb-0',
            fileHasPreview
              ? 'rounded-lg [&_.img-container]:h-32 [&_img]:aspect-auto [&_img]:h-[inherit] [&_img]:w-full'
              : isCompact
                ? '[&>div]:p-0 [&_svg]:h-12 [&_svg]:w-12'
                : '[&>div]:p-0 [&_svg]:h-14 [&_svg]:w-14',
            isDynamic ? 'h-auto [&_.img-container]:h-auto [&_img]:h-auto' : '',
          )}>
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
          <AnimatePresence>
            {!isHidden && (
              <div
                key={`size-${file.id}`}
                className={
                  'absolute right-1.5 top-1.5 z-30 rounded-full bg-stone-200 !px-1.5 !py-0.5 text-xs dark:bg-stone-700'
                }>
                <p>{formattedSize}</p>
              </div>
            )}
            {isCompact && (
              <div
                key={`compact-${file.id}`}
                className={tw(
                  'absolute inset-0 z-20 flex rounded-lg !px-1.5 !py-1',
                  'bg-gradient-to-t from-stone-800/70 to-stone-800/0',
                )}>
                <p
                  onClick={handleClick}
                  key={`title-${file.id}`}
                  className={tw(
                    'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                    'mt-auto text-sm text-stone-100',
                    !isCompact && 'lg:text-base',
                  )}>
                  {file.file_name}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {isDefaultDisplay && (
            <div className={'px-2 py-1'}>
              <div className={'flex items-center'}>
                <p
                  onClick={handleClick}
                  className={tw(
                    'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                    'text-sm',
                    !isCompact && 'lg:text-base',
                  )}>
                  {file.file_name}
                </p>
                {!context.viewSettings?.scrollControlMissing && (
                  <button
                    onClick={e => {
                      context.handleContext(
                        { x: e.clientX, y: e.clientY },
                        file,
                      );
                    }}
                    className={'cursor-pointer'}>
                    <EllipsisVerticalIcon
                      className={'h-6 w-6 text-stone-700 dark:text-stone-300'}
                    />
                  </button>
                )}
              </div>
              <p
                key={`updated-${file.updated_at}`}
                className={
                  'whitespace-nowrap text-xs font-light text-stone-500 dark:text-stone-400'
                }>
                <ClockIcon className={'inline h-3.5 w-3.5'} />{' '}
                {formatDistanceToNow(file.updated_at)} ago
              </p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
