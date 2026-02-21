import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import {
  getVirtualRowData,
  PagedVirtualDisplay,
  type VirtualDisplayItemData,
} from '../pagedVirtualDisplay';
import type { CSSProperties, RefObject } from 'react';
import { isFileModel } from '@models/file.ts';
import { FileGridSort } from '@pages/explorer/displayAlternatives/fileGrid/fileGridSort.tsx';
import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { MobileFileItem } from '@pages/explorer/file/mobileFileItem.tsx';
import { MobileFolderItem } from '@pages/explorer/folder/mobileFolderItem.tsx';
import { MOBILE_FILE_LIST_ITEM_HEIGHT } from '@lib/constants.ts';

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

  if (isFileModel(itemData))
    return (
      <MobileFileItem
        i={index}
        selected={selectedFiles.map(file => file.id)}
        onSelect={onSelectFile}
        key={itemData.id}
        file={itemData}
        style={style}
      />
    );

  return (
    <MobileFolderItem
      style={style}
      i={index}
      selected={selectedFolders.map(folder => folder.id)}
      onSelect={onSelectFolder}
      key={itemData.id}
      folder={itemData}
    />
  );
}

function MobileListHeader({ ref }: { ref?: RefObject<HTMLDivElement> }) {
  const { shareUuid, viewSettings, files, folders, currentFolder } =
    useExplorerData();

  return (
    <div ref={ref} className={'h-11 flex items-center px-5'}>
      <div className={' flex items-center gap-2'}>
        {!viewSettings?.noSelect && (
          <SelectAllCheckBox files={files} folders={folders} />
        )}
        <p
          key={`mobile-info-${currentFolder}`}
          className={'text-sm text-stone-500 animate-fade-in-right'}
        >
          {folders.length} Folders &bull; {files.length} Files
        </p>
        {!viewSettings?.limitedView && !shareUuid && (
          <div
            key={`mobile-sort-${currentFolder}`}
            className={'animate-fade-in-right delay-100'}
          >
            <FileGridSort />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileList() {
  return (
    <PagedVirtualDisplay
      itemSize={MOBILE_FILE_LIST_ITEM_HEIGHT}
      header={<MobileListHeader />}
      showNoItems
      row={Row}
    />
  );
}
