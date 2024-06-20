import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import useContextMenu from '@hooks/useContextMenu.ts';
import { Portal } from 'react-portal';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
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
import { formatBytes } from '@lib/fileSize.ts';
import { TableHeader } from '@pages/explorer/fileTable/tableHeader.tsx';
import FileDisplay from '@pages/explorer/file/display/fileDisplay.tsx';

export type Selected = { files: string[]; folders: string[] };

export function FileTable({
  files,
  folders,
}: {
  files: FileModel[];
  folders: FolderModel[];
}) {
  const selectedDisplayFile = useExplorerStore(s => s.current.selectedFile);
  const {
    selectedFolders,
    selectedFiles,
    selectNone,
    selectFile,
    selectFolder,
  } = useExplorerStore(s => s.selectedResources);
  const currentFolder = useExplorerStore(s => s.current.folder);

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
      <LayoutGroup id={'fileTable'}>
        <table className={'w-full table-auto text-left'}>
          <TableHeader
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
          <motion.tbody
            variants={containerVariant}
            initial={'hidden'}
            animate={'show'}
            key={currentFolder}
            className={tw(isControl && '[&_tr]:cursor-copy')}>
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
            <motion.tr
              variants={itemTransitionVariant}
              className={
                'cursor-default select-none border-none text-sm text-stone-500/50 [&>td]:py-5 [&>td]:pb-32'
              }>
              <td />
              <td>
                {folders.length} Folders <br />
                {files.length} Files
              </td>
              <td align={'right'}>
                {formatBytes(files.reduce((a, b) => a + b.file_size, 0))}
              </td>
              <td />
            </motion.tr>
          </motion.tbody>
        </table>
        <FileDisplay
          onSelect={selectFile}
          file={selectedDisplayFile}
          isSelected={
            !!(
              selectedDisplayFile &&
              selectedFiles.includes(selectedDisplayFile?.id)
            )
          }
        />
      </LayoutGroup>

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
