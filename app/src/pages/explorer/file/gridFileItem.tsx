import { fileHasPreview, FileModel, normalizeFileType } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useContext, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import {
  itemTransitionVariant,
  transitionStop,
} from '@components/defaults/transition.ts';
import { Checkbox } from '@nextui-org/react';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import tw from '@utils/classMerge.ts';
import { FileTypeDisplay } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { formatBytes } from '@utils/fileSize.ts';
import { ClockIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { DetailType } from '@stores/preferenceStore.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { isTouchDevice } from '@utils/touch.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { getMultiMoveBySelected } from '@pages/explorer/components/move/getMultiMoveBySelected.ts';

export default function GridFileItem({
  index,
  fileIndex,
  file,
  selected,
  onSelect,
  dynamic,
  details,
}: {
  index: number;
  fileIndex: number;
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
  dynamic?: boolean;
  details: DetailType;
}) {
  const [disabled, setDisabled] = useState(false);
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );

  const isSelected = selected.includes(file.id);
  const isDynamic = dynamic && fileHasPreview(file);

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
    if (isControl) onSelect(file.id);
    else if (isShift) context.select.setRange(index);
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

  return (
    <motion.div
      id={file.id}
      layout
      variants={index < transitionStop ? itemTransitionVariant : undefined}
      onContextMenu={e => {
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group relative rounded-lg outline outline-2 outline-offset-2',
        'outline-transparent transition-[outline-color]',
        isSelected && 'bg-indigo-100/50 outline-indigo-300',
        isShift && 'cursor-pointer',
        context.select.rangeStart === index && 'bg-indigo-50',
      )}>
      <motion.div
        drag={
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
        <motion.div
          className={tw(
            'absolute z-30 flex items-start gap-2 px-2 py-1.5',
            '[&>button>svg]:w-5 [&>button]:-mt-0.5 [&>button]:p-0',
            'left-1.5 top-1.5 h-20 overflow-hidden rounded-t-lg',
            isDefaultDisplay &&
              'gap-3 pl-1.5 pt-2.5 [&>button>svg]:w-6  [&>button]:-mt-1',
            isHidden && 'left-0 top-0',
          )}>
          {!context.viewSettings?.noSelect && (
            <motion.div
              className={'-mt-1 h-4 w-4'}
              layoutId={`check-${file.id}`}>
              <Checkbox
                className={'h-4 w-4'}
                isSelected={isSelected}
                onValueChange={() => onSelect(file.id)}
                classNames={{ wrapper: 'backdrop-blur-md' }}
                size={isDefaultDisplay ? 'md' : 'sm'}
              />
            </motion.div>
          )}
          <Favorite
            id={file.id}
            type={'file'}
            active={file.favorite}
            iconOnly
            white
          />
        </motion.div>
        <div
          onClick={handleClick}
          className={tw(
            'relative h-32',
            isDefaultDisplay && 'm-1.5 mb-0',
            fileHasPreview(file)
              ? 'rounded-lg [&_.img-container]:h-32 [&_img]:aspect-auto [&_img]:h-[inherit] [&_img]:w-full'
              : isCompact
                ? '[&>div]:p-0 [&_svg]:h-12 [&_svg]:w-12'
                : '[&>div]:p-0 [&_svg]:h-14 [&_svg]:w-14',
            isDynamic ? 'h-auto [&_.img-container]:h-auto [&_img]:h-auto' : '',
          )}>
          {fileHasPreview(file) ? (
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
              <motion.div
                key={`size-${file.id}`}
                layoutId={`size-${file.id}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className={
                  'absolute right-1.5 top-1.5 z-30 rounded-full bg-stone-200 !px-1.5 !py-0.5 text-xs'
                }>
                <p>{formatBytes(file.file_size)}</p>
              </motion.div>
            )}
            {isCompact && (
              <motion.div
                layoutId={`compact-${file.id}`}
                key={`compact-${file.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={tw(
                  'absolute inset-0 z-20 flex rounded-lg !px-1.5 !py-1',
                  'bg-gradient-to-t from-stone-800/70 to-stone-800/0',
                )}>
                <motion.p
                  onClick={handleClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  layoutId={`title-${file.id}`}
                  key={`title-${file.id}`}
                  className={tw(
                    'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                    'mt-auto text-sm text-stone-100',
                    !isCompact && 'lg:text-base',
                  )}>
                  {file.file_name}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {isDefaultDisplay && (
            <motion.div
              animate={{ opacity: 1, height: 'auto', padding: '0.375rem' }}
              exit={{ opacity: 0, height: 0, padding: 0 }}
              transition={{ duration: 0.3 }}>
              <div className={'flex items-center'}>
                <motion.p
                  onClick={handleClick}
                  exit={{ opacity: 0 }}
                  layoutId={`title-${file.id}`}
                  className={tw(
                    'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
                    'text-sm',
                    !isCompact && 'lg:text-base',
                  )}>
                  {file.file_name}
                </motion.p>
                {!context.viewSettings?.scrollControlMissing && (
                  <motion.button
                    onClick={e => {
                      context.handleContext(
                        { x: e.clientX, y: e.clientY },
                        file,
                      );
                    }}
                    className={'cursor-pointer'}>
                    <EllipsisVerticalIcon
                      className={'h-6 w-6 text-stone-700'}
                    />
                  </motion.button>
                )}
              </div>
              <motion.p
                key={`updated-${file.updated_at}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                layoutId={`updated-${file.id}`}
                className={
                  'whitespace-nowrap text-xs font-light text-stone-500'
                }>
                <ClockIcon className={'inline h-3.5 w-3.5'} />{' '}
                {formatDistanceToNow(file.updated_at)} ago
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
