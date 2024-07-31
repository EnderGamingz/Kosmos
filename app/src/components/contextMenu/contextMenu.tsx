import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { isFileModel, isMultiple } from '@models/file.ts';
import { isFolderModel } from '@models/folder.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import {
  MoveToTrash,
  MultiMoveToTrash,
} from '@pages/explorer/components/delete';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import tw from '@utils/classMerge.ts';
import {
  MultiPermanentDelete,
  PermanentDeleteAction,
} from '@pages/explorer/components/delete/permanentDeleteAction.tsx';
import { MultiDownload } from '@pages/explorer/components/multiDownload.tsx';
import { ContextData } from '@hooks/useContextMenu.ts';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { CONTEXT_MENU_WIDTH } from '@lib/constants.ts';
import { isAlbumFile } from '@models/album.ts';
import AlbumAction from '@pages/explorer/pages/albums/AlbumAction.tsx';

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
          '[&_button:hover]:bg-stone-100 [&_button:hover]:text-stone-900 [&_button]:px-3 [&_button]:py-1.5',
          '[&_button]:rounded-md [&_button]:transition-colors',
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
  const currentFolder = useExplorerStore(s => s.current.folder);
  if (!data) return null;

  if (isAlbumFile(data)) {
    return (
      <>
        <ContextMenuTitle type={'file'} title={data.file_name} />
        <AlbumAction file={data} albumId={data.album_id} onClose={onClose} />
        <DownloadSingleAction
          type={'file'}
          id={data.id}
          name={data.file_name}
          onClose={onClose}
        />
        <ShareButton id={data.id} type={'file'} onClose={onClose} />
        <RenameAction
          type={'file'}
          id={data.id}
          name={data.file_name}
          onClose={onClose}
        />
        <hr />
      </>
    );
  } else if (isFileModel(data)) {
    return (
      <>
        <ContextMenuTitle type={'file'} title={data.file_name} />
        <AlbumAction file={data} onClose={onClose} />
        <DownloadSingleAction
          type={'file'}
          id={data.id}
          name={data.file_name}
          onClose={onClose}
        />
        <ShareButton id={data.id} type={'file'} onClose={onClose} />
        <RenameAction
          type={'file'}
          id={data.id}
          name={data.file_name}
          onClose={onClose}
        />
        <MoveAction
          type={'file'}
          name={data.file_name}
          id={data.id}
          current_parent={data.parent_folder_id}
          onClose={onClose}
        />
        <MoveToTrash id={data.id} name={data.file_name} onClose={onClose} />
      </>
    );
  } else if (isFolderModel(data)) {
    return (
      <>
        <ContextMenuTitle type={'folder'} title={data.folder_name} />
        <MultiDownload
          files={[]}
          folders={[data.id]}
          isContextAction
          onClose={onClose}
        />
        <ShareButton id={data.id} type={'folder'} onClose={onClose} />
        <RenameAction
          type={'folder'}
          id={data.id}
          name={data.folder_name}
          onClose={onClose}
        />
        <MoveAction
          type={'folder'}
          name={data.folder_name}
          id={data.id}
          current_parent={data.parent_id}
          onClose={onClose}
        />
        <PermanentDeleteAction
          deleteData={{ type: 'folder', id: data.id, name: data.folder_name }}
          onClose={onClose}
        />
        <MultiPermanentDelete
          deleteData={{ folders: [data.id], files: [] }}
          onClose={onClose}
        />
      </>
    );
  } else if (isMultiple(data)) {
    const title = `${data.files.length} file${data.files.length === 1 ? '' : 's'}, 
    ${data.folders.length} folder${data.folders.length === 1 ? '' : 's'}`;
    return (
      <>
        <ContextMenuTitle type={'multi'} title={title} />
        <MultiDownload
          files={data.files}
          folders={data.folders}
          isContextAction
          onClose={onClose}
        />
        <MoveAction
          type={'multi'}
          multiData={{ files: data.files, folders: data.folders }}
          onClose={onClose}
          current_parent={currentFolder}
        />

        {!!data.files.length && !data.folders.length && (
          <MultiMoveToTrash
            deleteData={{ files: data.files }}
            onClose={onClose}
          />
        )}
        <hr />
        <MultiPermanentDelete
          deleteData={{ folders: data.folders, files: data.files }}
          onClose={onClose}
        />
      </>
    );
  }

  return null;
}
