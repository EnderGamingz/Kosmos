import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { motion } from 'framer-motion';
import { TableFolderItem } from '@pages/explorer/folder/tableFolderItem.tsx';
import { TableFileItem } from '@pages/explorer/file/tableFileItem.tsx';
import { useKeyStore } from '@stores/keyStore.ts';
import tw from '@utils/classMerge.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/defaults/transition.ts';
import { formatBytes } from '@utils/fileSize.ts';
import { TableHeader } from '@pages/explorer/displayAlternatives/fileTable/tableHeader.tsx';
import { ReactNode, useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import InfiniteScroll from 'react-infinite-scroller';
import { ViewSettings } from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';

export function PagedWrapper({
  viewSettings,
  children,
}: {
  viewSettings?: ViewSettings;
  children: ReactNode;
}) {
  if (!viewSettings?.paged) return children;
  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={viewSettings.onLoadNextPage || (() => {})}
      hasMore={viewSettings.hasNextPage}
      useWindow={false}
      threshold={500}
      loader={
        <div className={'p-1 text-center text-sm text-stone-600'} key={0}>
          Loading ...
        </div>
      }>
      {children}
    </InfiniteScroll>
  );
}

export function FileTable() {
  const { folder: currentFolder } = useExplorerStore(s => s.current);
  const { selectedFolders, selectedFiles, selectFile, selectFolder } =
    useExplorerStore(s => s.selectedResources);

  const isControl = useKeyStore(s => s.keys.ctrl);
  const { viewSettings, files, folders } = useContext(DisplayContext);

  const totalFileSize = formatBytes(files.reduce((a, b) => a + b.file_size, 0));

  return (
    <PagedWrapper viewSettings={viewSettings}>
      <table className={'w-full table-auto overflow-hidden text-left'}>
        <TableHeader files={files} folders={folders} />
        <motion.tbody
          variants={containerVariant()}
          initial={'hidden'}
          animate={'show'}
          transition={{ duration: 10 }}
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
              fileIndex={i}
              selected={selectedFiles}
              onSelect={selectFile}
              key={file.id}
              file={file}
            />
          ))}
          {!files.length && !folders.length ? (
            <EmptyList table />
          ) : (
            <motion.tr
              layout
              variants={itemTransitionVariant}
              className={
                'cursor-default select-none border-none text-sm text-stone-500/50 [&>td]:py-5 [&>td]:pb-32'
              }>
              {!viewSettings?.binView && <td />}
              <td className={tw(!!viewSettings?.binView && 'pl-4')}>
                {folders.length} Folders <br />
                {files.length} Files
              </td>
              <td align={'right'}>{totalFileSize}</td>
              <td />
            </motion.tr>
          )}
        </motion.tbody>
      </table>
    </PagedWrapper>
  );
}
