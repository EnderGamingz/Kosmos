import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import useContextMenu from '@hooks/useContextMenu.ts';
import { Checkbox, Skeleton } from '@nextui-org/react';
import { Portal } from 'react-portal';
import { AnimatePresence, motion } from 'framer-motion';
import ContextMenu, { ContextMenuContent } from '@components/contextMenu.tsx';
import { FolderItem } from '@pages/explorer/folder/folderItem.tsx';
import { FileItem } from '@pages/explorer/file/fileItem.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import tw from '@lib/classMerge.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import { MultipleActionButton } from '@pages/explorer/components/multipleActionButton.tsx';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/transition.ts';

export type Selected = { files: string[]; folders: string[] };

export function FileTable({
  files,
  folders,
}: {
  files: FileModel[];
  folders: FolderModel[];
}) {
  const {
    selectedFolders,
    selectedFiles,
    selectNone,
    selectFile,
    selectFolder,
  } = useExplorerStore(s => s.selectedResources);

  const isAllSelected =
    selectedFolders.length === folders.length &&
    selectedFiles.length === files?.length;

  const isNoneSelected = !selectedFiles.length && !selectedFolders.length;
  const isPartialSelected = !isAllSelected && !isNoneSelected;
  const hasData = !!folders.length || !!files.length;
  const isSomeSelected = !isNoneSelected && hasData;

  const context = useContextMenu();

  const isControl = useKeyStore(s => s.ctrl);

  const selectedData: Selected = {
    folders: selectedFolders,
    files: selectedFiles,
  };

  return (
    <>
      <MultipleActionButton
        someSelected={isSomeSelected}
        handleClick={pos => {
          context.setPos({ x: pos.x, y: pos.y });
          context.setClicked(true);
          context.setData(selectedData);
        }}
      />
      <table className={'w-full table-auto text-left'}>
        <thead>
          <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
            <th>
              <Checkbox
                isSelected={isAllSelected && hasData}
                isIndeterminate={isPartialSelected}
                onValueChange={() => {
                  if ((!isNoneSelected && !isAllSelected) || isNoneSelected) {
                    files.map(file => selectFile(file.id));
                    folders.map(folder => selectFolder(folder.id));
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
        <motion.tbody
          variants={containerVariant}
          initial={'hidden'}
          animate={'show'}
          key={folders.length + files.length}
          className={tw('divide-y', isControl && '[&_tr]:cursor-copy')}>
          {folders.map((folder: FolderModel, i: number) => (
            <FolderItem
              i={i}
              selected={selectedFolders}
              onSelect={selectFolder}
              key={folder.id}
              folder={folder}
              onContext={(folder, pos) => {
                context.setPos(pos);
                context.setClicked(true);
                context.setData(
                  isPartialSelected || isAllSelected ? selectedData : folder,
                );
              }}
            />
          ))}
          {files.map((file: FileModel, i: number) => (
            <FileItem
              i={folders.length + i}
              selected={selectedFiles}
              onSelect={selectFile}
              key={file.id}
              file={file}
              onContext={(file, pos) => {
                context.setPos(pos);
                context.setClicked(true);
                context.setData(
                  isPartialSelected || isAllSelected ? selectedData : file,
                );
              }}
            />
          ))}
        </motion.tbody>
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

export function FileTableLoading() {
  return (
    <>
      <style>
        {`
        .file-list {
        overflow-y:hidden;
        }
        `}
      </style>
      <table className={'w-full table-auto text-left opacity-60'}>
        <thead>
          <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
            <th>
              <div className={'w-7'}>
                <Skeleton className={'h-5 w-5 rounded-md'} />
              </div>
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
        <motion.tbody
          variants={containerVariant}
          initial='hidden'
          animate='show'
          className={'divide-y divide-stone-300/50 overflow-hidden'}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.tr
              variants={itemTransitionVariant}
              key={i}
              className={'[&_td]:p-3  [&_td]:font-bold [&_td]:text-stone-700'}>
              <td className={'p-3'}>
                <div className={'w-7'}>
                  <Skeleton className={'h-5 w-5 rounded-md opacity-50'} />
                </div>
              </td>
              <td className={'w-full'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </>
  );
}
