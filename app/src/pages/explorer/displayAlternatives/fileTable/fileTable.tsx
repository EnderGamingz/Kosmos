import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { motion } from 'framer-motion';
import { TableFolderItem } from '@pages/explorer/folder/tableFolderItem.tsx';
import { TableFileItem } from '@pages/explorer/file/tableFileItem.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import tw from '@lib/classMerge.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/transition.ts';
import { formatBytes } from '@lib/fileSize.ts';
import { TableHeader } from '@pages/explorer/displayAlternatives/fileTable/tableHeader.tsx';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

export function FileTable() {
  const { folder: currentFolder } = useExplorerStore(s => s.current);
  const { selectedFolders, selectedFiles, selectFile, selectFolder } =
    useExplorerStore(s => s.selectedResources);

  const isControl = useKeyStore(s => s.keys.ctrl);
  const { recentView, files, folders } = useContext(DisplayContext);

  return (
    <>
      <table className={'w-full table-auto text-left'}>
        <TableHeader noSort={recentView} files={files} folders={folders} />
        <motion.tbody
          variants={containerVariant()}
          initial={'hidden'}
          animate={'show'}
          key={currentFolder}
          className={tw(isControl && '[&_tr]:cursor-copy')}>
          {folders.map((folder: FolderModel, i: number) => (
            <TableFolderItem
              i={i}
              selected={selectedFolders}
              onSelect={selectFolder}
              key={folder.id}
              folder={folder}
            />
          ))}
          {files.map((file: FileModel, i: number) => (
            <TableFileItem
              i={folders.length + i}
              selected={selectedFiles}
              onSelect={selectFile}
              key={file.id}
              file={file}
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
    </>
  );
}
