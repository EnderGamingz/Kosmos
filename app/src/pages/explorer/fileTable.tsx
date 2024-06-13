import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import useContextMenu from '@hooks/useContextMenu.ts';
import { Checkbox } from '@nextui-org/react';
import { Portal } from 'react-portal';
import { AnimatePresence, motion } from 'framer-motion';
import ContextMenu, { ContextMenuContent } from '@components/contextMenu.tsx';
import { FolderItem } from '@pages/explorer/folder/folderItem.tsx';
import { FileItem } from '@pages/explorer/file/fileItem.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import tw from '@lib/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export type Selected = { files: string[]; folders: string[] };

export function FileTable({
  files,
  folders,
  selectedFiles,
  selectedFolders,
  onFileSelect,
  onFolderSelect,
  selectAll,
  selectNone,
}: {
  files: FileModel[];
  folders: FolderModel[];
  selectedFiles: string[];
  selectedFolders: string[];
  onFileSelect: (id: string) => void;
  onFolderSelect: (id: string) => void;
  selectAll: () => void;
  selectNone: () => void;
}) {
  const isAllSelected =
    selectedFolders.length === folders.length &&
    selectedFiles.length === files?.length;

  const isNoneSelected = !selectedFiles.length && !selectedFolders.length;
  const isSomeSelected = !isAllSelected && !isNoneSelected;
  const hasData = !!folders.length && !!files?.length;

  const context = useContextMenu();

  const isControl = useKeyStore(s => s.ctrl);
  const selectedData: Selected = {
    folders: selectedFolders,
    files: selectedFiles,
  };

  return (
    <>
      <AnimatePresence>
        {(isSomeSelected || (isAllSelected && hasData)) && (
          <motion.button
            onClick={e => {
              context.setPos({ x: e.clientX, y: e.clientY });
              context.setClicked(true);
              context.setData(selectedData);
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className={tw(
              'absolute right-2 top-2 flex items-center gap-1 rounded-full bg-stone-400/50',
              'transition-all hover:bg-stone-400/80 hover:text-stone-800 hover:shadow-sm',
              'px-2 py-1 pr-4 backdrop-blur-lg',
            )}>
            <EllipsisVerticalIcon className={'h-5 w-5'} />
            Actions
          </motion.button>
        )}
      </AnimatePresence>
      <table className={'w-full table-auto text-left'}>
        <thead>
          <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
            <th>
              <Checkbox
                isSelected={isAllSelected && hasData}
                isIndeterminate={isSomeSelected}
                onValueChange={() => {
                  if ((!isNoneSelected && !isAllSelected) || isNoneSelected) {
                    selectAll();
                  } else if (isAllSelected) {
                    selectNone();
                  }
                }}
              />
            </th>
            <th className={'w-full'}>Name</th>
            <th align={'right'} className={'min-w-[100px]'}>
              Size
            </th>
            <th align={'right'} className={'min-w-[155px]'}>
              Modified
            </th>
          </tr>
        </thead>
        <tbody className={tw('divide-y', isControl && '[&_tr]:cursor-copy')}>
          {folders.map((folder: FolderModel) => (
            <FolderItem
              selected={selectedFolders}
              onSelect={onFolderSelect}
              key={folder.id}
              folder={folder}
              onContext={(folder, pos) => {
                context.setPos(pos);
                context.setClicked(true);
                context.setData(
                  isSomeSelected || isAllSelected ? selectedData : folder,
                );
              }}
            />
          ))}
          {files.map((file: FileModel) => (
            <FileItem
              selected={selectedFiles}
              onSelect={onFileSelect}
              key={file.id}
              file={file}
              onContext={(file, pos) => {
                context.setPos(pos);
                context.setClicked(true);
                context.setData(
                  isSomeSelected || isAllSelected ? selectedData : file,
                );
              }}
            />
          ))}
        </tbody>
      </table>
      <AnimatePresence>
        {context.clicked && (
          <Portal>
            <ContextMenu
              pos={context.pos}
              onClose={() => context.setClicked(false)}>
              <ContextMenuContent
                data={context.data}
                onClose={() => context.setClicked(false)}
              />
            </ContextMenu>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
