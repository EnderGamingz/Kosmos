import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { FileModel, isFileModel, OperationType } from '@models/file.ts';
import { FolderModel, isFolderModel } from '@models/folder.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import { MoveToTrash } from '@pages/explorer/components/delete';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import tw from '@lib/classMerge.ts';
import { Tooltip } from '@nextui-org/react';
import { PermanentDeleteAction } from '@pages/explorer/components/delete/permanentDeleteAction.tsx';
import { MultiDownload } from '@pages/explorer/components/multiDownload.tsx';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';

const menuWidth = 250;

export default function ContextMenu({
  children,
  pos,
  onClose,
}: {
  children: ReactNode;
  pos: { x: number; y: number };
  onClose: () => void;
}) {
  const isOverflowingX = pos.x + menuWidth > window.innerWidth;
  const isOverflowingY = pos.y + menuWidth > window.innerHeight;

  return (
    <>
      <style>
        {`
            .file-list {
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              overflow: hidden !important;
            }
          `}
      </style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onContextMenu={e => {
          e.preventDefault();
          onClose();
        }}
        onClick={onClose}
        className={
          'fixed inset-0 z-50 h-screen w-screen bg-overlay/30 backdrop-blur-sm backdrop-saturate-150'
        }
      />
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
          minWidth: menuWidth,
          maxWidth: menuWidth,
        }}
        onContextMenu={e => e.preventDefault()}>
        {children}
      </motion.div>
    </>
  );
}

function ContextMenuTitle({
  title,
  type,
}: {
  title: string;
  type: OperationType;
}) {
  return (
    <div
      className={
        'max-w-[inherit] overflow-hidden overflow-ellipsis border-b border-stone-300/50 pb-1'
      }>
      <Tooltip content={title}>
        <span
          className={tw(
            'flex items-center gap-1 whitespace-nowrap text-sm font-light text-stone-800',
            '[&_>svg]:h-4 [&_>svg]:min-w-4',
          )}>
          {type === 'folder' ? <FolderIcon /> : <DocumentIcon />}
          {title}
        </span>
      </Tooltip>
    </div>
  );
}

export function ContextMenuContent({
  data,
  onClose,
}: {
  data?: FileModel | FolderModel;
  onClose: () => void;
}) {
  if (!data) return null;

  if (isFileModel(data)) {
    return (
      <>
        <ContextMenuTitle type={'file'} title={data.file_name} />
        <DownloadSingleAction
          type={'file'}
          id={data.id}
          name={data.file_name}
          onClose={onClose}
        />
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
      </>
    );
  }

  return null;
}
