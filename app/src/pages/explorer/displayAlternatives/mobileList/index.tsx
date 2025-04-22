import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import {
  getVirtualRowData,
  PagedVirtualDisplay,
  PagedVirtualDisplayContext,
  VirtualDisplayItemData,
} from '../pagedVirtualDisplay';
import { ReactNode, useContext } from 'react';
import { isFileModel } from '@models/file.ts';
import EmptyList from '../../components/EmptyList';
import { cn } from '@/lib/utils';
import { FileGridSort } from '@pages/explorer/displayAlternatives/fileGrid/fileGridSort.tsx';
import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { MobileFileItem } from '@pages/explorer/file/mobileFileItem.tsx';
import { MobileFolderItem } from '@pages/explorer/folder/mobileFolderItem.tsx';
import { MOBILE_FILE_LIST_ITEM_HEIGHT } from '@lib/constants.ts';

const Inner = ({ children }: { children: ReactNode }) => {
  const { header, top, footer } = useContext(PagedVirtualDisplayContext);
  return (
    <div style={{ top, position: 'absolute', width: '100%' }}>
      {header}
      {children}
      {footer}
    </div>
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
      <MobileFileItem
        i={index}
        selected={selectedFiles.map(file => file.id)}
        onSelect={onSelectFile}
        key={itemData.id}
        file={itemData}
      />
    );
  }

  return (
    <MobileFolderItem
      i={index}
      selected={selectedFolders.map(folder => folder.id)}
      onSelect={onSelectFolder}
      key={itemData.id}
      folder={itemData}
    />
  );
}

function MobileListHeader() {
  const { shareUuid, viewSettings, files, folders } = useExplorerData();
  return (
    <div className={'my-[12px] px-5'}>
      <div className={' flex items-center gap-2'}>
        {!viewSettings?.noSelect && (
          <SelectAllCheckBox files={files} folders={folders} />
        )}
        <p className={'text-sm text-stone-500 animate-fade-in-right'}>
          {folders.length} Folders &bull; {files.length} Files
        </p>
        {!viewSettings?.limitedView && !shareUuid && (
          <div className={'animate-fade-in-right delay-100'}>
            <FileGridSort />
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileList() {
  const { viewSettings, files, folders, totalFileSize } = useExplorerData();

  return (
    <PagedVirtualDisplay
      itemSize={MOBILE_FILE_LIST_ITEM_HEIGHT}
      inner={Inner}
      header={<MobileListHeader />}
      footer={
        !files.length && !folders.length ? (
          <EmptyList />
        ) : (
          <div
            className={
              'grid place-items-center text-sm mt-10 pb-32 text-muted-foreground'
            }>
            <p className={cn(!!viewSettings?.binView && 'pl-4')}>
              {folders.length} Folders &bull; {files.length} Files &bull;{' '}
              {totalFileSize}
            </p>
          </div>
        )
      }
      row={Row}
    />
  );
}
