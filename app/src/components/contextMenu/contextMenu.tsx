import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { isFileModel, isMultiple } from '@models/file.ts';
import { isFolderModel } from '@models/folder.ts';
import tw from '@utils/classMerge.ts';
import { ContextData } from '@hooks/useContextMenu.ts';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import { CONTEXT_MENU_WIDTH } from '@lib/constants.ts';
import { isAlbumFile } from '@models/album.ts';
import { isFileWindow } from '@utils/contextDataParse.ts';
import { AlbumContextMenu } from '@components/contextMenu/menus/albumContextMenu.tsx';
import { FileContextMenu } from '@components/contextMenu/menus/fileContextMenu.tsx';
import { FolderContextMenu } from '@components/contextMenu/menus/folderContextMenu.tsx';
import { MultiContextMenu } from '@components/contextMenu/menus/multiContextMenu.tsx';
import { FileWindowContextMenu } from '@components/contextMenu/menus/fileWindowContextMenu.tsx';

export default function ContextMenu({
  children,
  pos,
  onClose,
}: {
  children: ReactNode;
  pos: { x: number; y: number };
  onClose: () => void;
}) {
  const isOverflowingX = pos.x + CONTEXT_MENU_WIDTH > window.innerWidth;
  const isOverflowingY = pos.y + CONTEXT_MENU_WIDTH > window.innerHeight;

  return (
    <>
      <style>
        {`
            .file-list {
              overflow: hidden !important;
            }
        `}
      </style>
      <Backdrop onClose={onClose} />
      <motion.div
        className={tw(
          'absolute z-50 grid select-none gap-1 rounded-md bg-white p-3 shadow-lg',
          '[&_button>svg]:h-5 [&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:text-left',
          '[&_button:not(.no-pre):hover]:bg-stone-100 [&_button:not(.no-pre):hover]:text-stone-900 [&_button:not(.no-pre)]:px-3 [&_button:not(.no-pre)]:py-1.5',
          '[&_button]:rounded-md [&_button]:transition-colors',
          'bg-stone-50 dark:bg-stone-800 dark:[&_button:not(.no-pre):hover]:bg-stone-600/50 dark:[&_button:not(.no-pre):hover]:text-stone-100',
        )}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.2 }}
        style={{
          top: !isOverflowingY ? pos.y : undefined,
          bottom: isOverflowingY ? '10px' : undefined,
          left: !isOverflowingX ? pos.x : undefined,
          right: isOverflowingX ? '10px' : undefined,
          minWidth: CONTEXT_MENU_WIDTH,
          maxWidth: CONTEXT_MENU_WIDTH,
        }}
        onContextMenu={e => e.preventDefault()}>
        {children}
      </motion.div>
    </>
  );
}

export function ContextMenuContent({
  data,
  onClose,
}: {
  data: ContextData;
  onClose: () => void;
}) {
  if (!data) return null;

  if (isAlbumFile(data))
    return <AlbumContextMenu data={data} onClose={onClose} />;
  if (isFileModel(data))
    return <FileContextMenu data={data} onClose={onClose} />;
  if (isFolderModel(data))
    return <FolderContextMenu data={data} onClose={onClose} />;
  if (isMultiple(data))
    return <MultiContextMenu data={data} onClose={onClose} />;
  if (isFileWindow(data)) return <FileWindowContextMenu onClose={onClose} />;

  return null;
}
