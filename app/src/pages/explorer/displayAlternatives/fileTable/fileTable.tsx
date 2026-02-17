import { TableHeader } from '@pages/explorer/displayAlternatives/fileTable/tableHeader.tsx';
import { isFileModel } from '@models/file.ts';
import { TableFolderItem } from '@pages/explorer/folder/tableFolderItem.tsx';
import { TableFileItem } from '@pages/explorer/file/tableFileItem.tsx';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import {
  getVirtualRowData,
  PagedVirtualDisplay,
  type VirtualDisplayItemData,
} from '@pages/explorer/displayAlternatives/pagedVirtualDisplay.tsx';
import { FILE_TABLE_ITEM_HEIGHT } from '@lib/constants.ts';
import type { CSSProperties } from 'react';

function Row({
  index,
  data,
  style,
}: {
  index: number;
  data: VirtualDisplayItemData;
  style?: CSSProperties;
}) {
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
        style={style}
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
      style={style}
      i={index}
      selected={selectedFolders.map(folder => folder.id)}
      onSelect={onSelectFolder}
      key={itemData.id}
      folder={itemData}
      outerDisabled
    />
  );
}

export default function FileTable() {
  const { files, folders } = useExplorerData();

  return (
    <PagedVirtualDisplay
      itemSize={FILE_TABLE_ITEM_HEIGHT}
      header={<TableHeader files={files} folders={folders} />}
      showNoItems
      row={Row}
    />
  );
}
