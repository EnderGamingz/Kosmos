import { fileHasPreview, FileModel, normalizeFileType } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useExplorerStore } from '@stores/folderStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import {
  itemTransitionVariant,
  transitionStop,
} from '@components/transition.ts';
import { Checkbox } from '@nextui-org/react';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import tw from '@lib/classMerge.ts';
import { FileTypeDisplay } from '@pages/explorer/file/display/fileDisplayHandler.tsx';
import { formatBytes } from '@lib/fileSize.ts';
import { ClockIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { DetailType } from '@stores/preferenceStore.ts';

export default function GridFileItem({
  index,
  file,
  selected,
  onSelect,
  dynamic,
  details,
}: {
  index: number;
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
  dynamic?: boolean;
  details: DetailType;
}) {
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

  const selectFile = useExplorerStore(s => s.current.selectCurrentFile);
  const contextMenu = useContext(DisplayContext);

  const handleClick = () => {
    if (isControl) onSelect(file.id);
    else if (isShift) contextMenu.select.setRange(index);
    else selectFile(file);
  };

  return (
    <motion.div
      layout
      variants={index < transitionStop ? itemTransitionVariant : undefined}
      onContextMenu={e => {
        e.preventDefault();
        contextMenu.handleContext({ x: e.clientX, y: e.clientY }, file);
      }}
      className={tw(
        'group relative rounded-xl outline outline-2 -outline-offset-2 transition-all',
        'outline-transparent',
        isSelected && 'bg-indigo-100/50 outline-indigo-300',
        isShift && 'cursor-pointer hover:scale-95',
        contextMenu.select.rangeStart === index && 'scale-95',
      )}>
      <motion.div
        className={tw(
          'absolute z-30',
          isDefaultDisplay ? 'left-3 top-3' : 'left-1.5 top-0.5',
        )}
        layoutId={`check-${file.id}`}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
          classNames={{ wrapper: 'backdrop-blur-md' }}
          size={isDefaultDisplay ? 'md' : 'sm'}
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
          !!isDynamic && 'h-auto [&_.img-container]:h-auto [&_img]:h-auto',
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
                'absolute right-1.5 top-1.5 z-10 rounded-full bg-stone-200 !px-1.5 !py-0.5 text-xs'
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
              <motion.button
                onClick={e => {
                  contextMenu.handleContext(
                    { x: e.clientX, y: e.clientY },
                    file,
                  );
                }}
                className={'cursor-pointer'}>
                <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
              </motion.button>
            </div>
            <motion.p
              key={`updated-${file.updated_at}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              layoutId={`updated-${file.id}`}
              className={'whitespace-nowrap text-xs font-light text-stone-500'}>
              <ClockIcon className={'inline h-3.5 w-3.5'} />{' '}
              {formatDistanceToNow(file.updated_at)} ago
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
