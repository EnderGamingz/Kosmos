import { fileHasPreview, FileModel, normalizeFileType } from '@models/file.ts';
import { motion } from 'framer-motion';
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
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function GridFileItem({
  index,
  file,
  selected,
  onSelect,
  dynamic,
}: {
  index: number;
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
  dynamic?: boolean;
}) {
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );

  const isSelected = selected.includes(file.id);
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
        className={'absolute left-3 top-3 z-20'}
        layoutId={`check-${file.id}`}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
          classNames={{ wrapper: 'backdrop-blur-md' }}
        />
      </motion.div>
      <div
        onClick={handleClick}
        className={tw(
          'relative m-1.5 mb-0 h-32',
          fileHasPreview(file)
            ? 'rounded-lg [&_.img-container]:h-32 [&_img]:aspect-auto [&_img]:h-[inherit] [&_img]:w-full'
            : '[&>div]:p-0 [&_svg]:h-14 [&_svg]:w-14',
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
        <motion.div
          layoutId={`size-${file.id}`}
          className={
            'absolute right-1.5 top-1.5 z-10 rounded-full bg-stone-200 !px-1.5 !py-0.5 text-xs'
          }>
          <p>{formatBytes(file.file_size)}</p>
        </motion.div>
      </div>
      <div className={'m-1.5'}>
        <div className={'flex items-center'}>
          <motion.p
            onClick={handleClick}
            exit={{ opacity: 0 }}
            layoutId={`title-${file.id}`}
            className={tw(
              'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap pr-2',
              'text-sm lg:text-base',
            )}>
            {file.file_name}
          </motion.p>
          <motion.button
            onClick={e => {
              contextMenu.handleContext({ x: e.clientX, y: e.clientY }, file);
            }}
            className={'cursor-pointer'}>
            <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
          </motion.button>
        </div>
        <motion.p
          layoutId={`updated-${file.id}`}
          className={' whitespace-nowrap text-xs font-light text-stone-500'}>
          Modified {formatDistanceToNow(file.updated_at)}
        </motion.p>
      </div>
    </motion.div>
  );
}
