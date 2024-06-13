import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import useContextMenu from '@hooks/useContextMenu.ts';
import { Checkbox } from '@nextui-org/react';
import { Portal } from 'react-portal';
import { AnimatePresence } from 'framer-motion';
import ContextMenu from '@components/contextMenu.tsx';
import { FolderItem } from '@pages/explorer/folder/folderItem.tsx';
import { FileItem } from '@pages/explorer/file/fileItem.tsx';

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
  const hasData = !!folders.length && !!files?.length;

  const context = useContextMenu();

  return (
    <>
      <table className={'w-full table-auto text-left'}>
        <thead>
          <tr className={'[&_th]:p-3'}>
            <th>
              <Checkbox
                isSelected={isAllSelected && hasData}
                isIndeterminate={!isAllSelected && !isNoneSelected}
                onValueChange={() => {
                  if ((!isNoneSelected && !isAllSelected) || isNoneSelected) {
                    selectAll();
                  } else if (isAllSelected) {
                    selectNone();
                  }
                }}
              />
            </th>
            <th>Name</th>
            <th align={'center'}>Size</th>
            <th align={'center'}>Added</th>
            <th align={'center'}>Actions</th>
          </tr>
        </thead>
        <tbody className={'divide-y'}>
          {folders.map((folder: FolderModel) => (
            <FolderItem
              selected={selectedFolders}
              onSelect={onFolderSelect}
              key={folder.id}
              folder={folder}
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
                context.setType('file');
                console.log(file);
              }}
            />
          ))}
        </tbody>
      </table>
      <Portal>
        <AnimatePresence>
          {context.clicked && (
            <ContextMenu
              onClose={() => context.setClicked(false)}
              pos={context.pos}>
              test
            </ContextMenu>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
