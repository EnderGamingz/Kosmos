import { createContext, JSX, ReactNode, useRef, useState } from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/pagedWrapper.tsx';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export const PagedVirtualDisplayContext = createContext<{
  top: number;
  setTop: (top: number) => void;
  header: ReactNode;
  footer: ReactNode;
}>({
  top: 0,
  setTop: () => {},
  header: <></>,
  footer: <></>,
});

export function VirtualDisplayElement({
  row,
  header,
  footer,
  inner,
  ...rest
}: {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  inner: ({ children }: { children: ReactNode }) => JSX.Element;
  row: FixedSizeListProps['children'];
} & Omit<FixedSizeListProps, 'children' | 'innerElementType'>) {
  const listRef = useRef<FixedSizeList | null>(null);
  const [top, setTop] = useState(0);

  return (
    <PagedVirtualDisplayContext.Provider
      value={{ top, setTop, header, footer }}>
      <FixedSizeList
        {...rest}
        innerElementType={inner}
        onItemsRendered={props => {
          const style =
            listRef.current &&
            // @ts-expect-error private method access
            listRef.current._getItemStyle(props.overscanStartIndex);
          setTop((style && style.top) || 0);

          // Call the original callback
          rest.onItemsRendered && rest.onItemsRendered(props);
        }}
        ref={listRef}>
        {row}
      </FixedSizeList>
    </PagedVirtualDisplayContext.Provider>
  );
}

export type VirtualDisplayItemData = {
  folders: FolderModelDTO[];
  files: FileModelDTO[];
  totalFolder: number;
  onSelectFile: (file: FileModelDTO) => void;
  onSelectFolder: (folder: FolderModelDTO) => void;
  selectedFiles: FileModelDTO[];
  selectedFolders: FolderModelDTO[];
};

export function getVirtualRowData({
  index,
  data,
}: {
  index: number;
  data: VirtualDisplayItemData;
}) {
  const {
    files,
    folders,
    totalFolder,
    onSelectFolder,
    onSelectFile,
    selectedFolders,
    selectedFiles,
  } = data;
  const itemData =
    index < totalFolder ? folders[index] : files[index - totalFolder];

  return {
    itemData,
    onSelectFolder,
    onSelectFile,
    selectedFolders,
    selectedFiles,
  };
}

export function PagedVirtualDisplay({
  inner,
  header,
  footer,
  row,
  itemSize,
}: {
  inner: ({ children }: { children: ReactNode }) => JSX.Element;
  header: ReactNode;
  footer: ReactNode;
  row: FixedSizeListProps['children'];
  itemSize: number;
}) {
  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    display,
    viewSettings,
    files,
    folders,
    onScroll,
  } = useExplorerData();

  const itemData: VirtualDisplayItemData = {
    folders,
    files,
    totalFolder: folders.length,
    onSelectFile: selectFile,
    onSelectFolder: selectFolder,
    selectedFiles,
    selectedFolders,
  };

  return (
    <PagedWrapper viewSettings={viewSettings}>
      <VirtualDisplayElement
        inner={inner}
        onScroll={onScroll}
        height={display.height || 500}
        width={'100%'}
        itemCount={folders.length + files.length}
        itemData={itemData}
        itemSize={itemSize}
        header={header}
        row={row}
        footer={footer}
      />
    </PagedWrapper>
  );
}
