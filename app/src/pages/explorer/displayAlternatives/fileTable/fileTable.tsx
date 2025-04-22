import { motion } from 'framer-motion';
import { TableHeader } from '@pages/explorer/displayAlternatives/fileTable/tableHeader.tsx';
import { ReactNode, useContext } from 'react';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { isFileModel } from '@models/file.ts';
import { TableFolderItem } from '@pages/explorer/folder/tableFolderItem.tsx';
import { TableFileItem } from '@pages/explorer/file/tableFileItem.tsx';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import { cn } from '@lib/utils.ts';
import {
  getVirtualRowData,
  PagedVirtualDisplay,
  PagedVirtualDisplayContext,
  VirtualDisplayItemData,
} from '@pages/explorer/displayAlternatives/pagedVirtualDisplay.tsx';
import { FILE_TABLE_ITEM_HEIGHT } from '@lib/constants.ts';

const Inner = ({ children }: { children: ReactNode }) => {
  const { header, top, footer } = useContext(PagedVirtualDisplayContext);
  return (
    <table
      className={'overflow-hidden text-left'}
      style={{ top, position: 'absolute', width: '100%' }}>
      {header}
      <tbody>{children}</tbody>
      {footer}
    </table>
  );
};

function Row({ index, data }: { index: number; data: VirtualDisplayItemData }) {
  const {
    onSelectFolder,
    onSelectFile,
    selectedFolders,
    selectedFiles,
    itemData,
  } = getVirtualRowData({ index, data });

  if (isFileModel(itemData)) {
    return (
      <TableFileItem
        i={index}
        selected={selectedFiles.map(file => file.id)}
        onSelect={onSelectFile}
        key={itemData.id}
        file={itemData}
        outerDisabled
      />
    );
  }

  return (
    <TableFolderItem
      i={index}
      selected={selectedFolders.map(folder => folder.id)}
      onSelect={onSelectFolder}
      key={itemData.id}
      folder={itemData}
      outerDisabled
    />
  );
}

export function FileTable() {
  const { viewSettings, files, folders, totalFileSize } = useExplorerData();

  return (
    <PagedVirtualDisplay
      itemSize={FILE_TABLE_ITEM_HEIGHT}
      inner={Inner}
      header={<TableHeader files={files} folders={folders} />}
      footer={
        !files.length && !folders.length ? (
          <EmptyList table />
        ) : (
          <motion.tfoot
            layout
            className={
              'cursor-default select-none border-none text-sm text-stone-500/50 [&_td]:py-5 [&_td]:pb-32 dark:[&_td]:text-stone-400'
            }>
            <tr>
              {!viewSettings?.binView && <td />}
              <td className={cn(!!viewSettings?.binView && 'pl-4')}>
                {folders.length} Folders <br />
                {files.length} Files
              </td>
              <td align={'right'}>{totalFileSize}</td>
              <td />
            </tr>
          </motion.tfoot>
        )
      }
      row={Row}
    />
  );
}
