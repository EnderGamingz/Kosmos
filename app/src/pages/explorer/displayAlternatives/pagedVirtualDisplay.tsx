import {
  type JSX,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  FixedSizeList,
  type FixedSizeListProps,
  type ReactElementType,
} from 'react-window';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/pagedWrapper.tsx';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Slot } from '@radix-ui/react-slot';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';

function PartRenderer({
  children,
  onHeight,
}: {
  children: ReactNode;
  onHeight: (height: number) => void;
}) {
  const elementRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const resizeObserver = new ResizeObserver(() => {
        onHeight(node.offsetHeight);
      });
      resizeObserver.observe(node);
    },
    [children],
  );

  return <Slot ref={elementRef}>{children}</Slot>;
}

export function VirtualDisplayElement({
  row,
  header,
  footer,
  inner,
  listHeight,
  listWrapperType,
  showNoItems,
  ...rest
}: {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  listHeight: number;
  inner?: ({ children }: { children: ReactNode }) => JSX.Element;
  row: FixedSizeListProps['children'];
  listWrapperType?: ReactElementType;
  showNoItems?: boolean;
} & Omit<FixedSizeListProps, 'children' | 'innerElementType' | 'height'>) {
  const [headerHeight, setHeaderHeight] = useState(0);

  const fixedHeight = useMemo(
    // Absolute magic happening here, the 10 is the devil, do not remove
    // or find the cause
    () => listHeight - headerHeight - 10,
    [listHeight, headerHeight],
  );

  return (
    <>
      <PartRenderer onHeight={setHeaderHeight}>{header}</PartRenderer>
      <FixedSizeList
        {...rest}
        height={showNoItems ? 0 : fixedHeight}
        innerElementType={listWrapperType}
      >
        {row}
      </FixedSizeList>
      {showNoItems && <EmptyList />}
    </>
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
  row,
  itemSize,
  listWrapperType,
  wrapperType,
  showNoItems,
}: {
  inner?: ({ children }: { children: ReactNode }) => JSX.Element;
  header: ReactNode;
  row: FixedSizeListProps['children'];
  itemSize: number;
  listWrapperType?: ReactElementType;
  wrapperType?: 'div' | 'table';
  showNoItems?: boolean;
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

  const itemCount = folders.length + files.length;
  return (
    <PagedWrapper viewSettings={viewSettings} type={wrapperType}>
      <VirtualDisplayElement
        inner={inner}
        listWrapperType={listWrapperType}
        onScroll={onScroll}
        listHeight={display.height || 500}
        width={'100%'}
        itemCount={itemCount}
        itemData={itemData}
        itemSize={itemSize}
        header={header}
        row={row}
        showNoItems={showNoItems && itemCount === 0}
      />
    </PagedWrapper>
  );
}
