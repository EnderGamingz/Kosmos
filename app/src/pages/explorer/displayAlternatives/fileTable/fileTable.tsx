import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { TableHeader } from '@pages/explorer/displayAlternatives/fileTable/tableHeader.tsx';
import {
  createContext,
  forwardRef,
  HTMLProps,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { FILE_TABLE_ITEM_HEIGHT } from '@lib/constants.ts';
import { isFileModel } from '@models/file.ts';
import { TableFolderItem } from '@pages/explorer/folder/tableFolderItem.tsx';
import { TableFileItem } from '@pages/explorer/file/tableFileItem.tsx';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/pagedWrapper.tsx';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

const VirtualTableContext = createContext<{
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

function VirtualTable({
  row,
  header,
  footer,
  ...rest
}: {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  row: FixedSizeListProps['children'];
} & Omit<FixedSizeListProps, 'children' | 'innerElementType'>) {
  const listRef = useRef<FixedSizeList | null>();
  const [top, setTop] = useState(0);

  return (
    <VirtualTableContext.Provider value={{ top, setTop, header, footer }}>
      <FixedSizeList
        {...rest}
        innerElementType={Inner}
        onItemsRendered={props => {
          const style =
            listRef.current &&
            // @ts-expect-error private method access
            listRef.current._getItemStyle(props.overscanStartIndex);
          setTop((style && style.top) || 0);

          // Call the original callback
          rest.onItemsRendered && rest.onItemsRendered(props);
        }}
        ref={el => (listRef.current = el)}>
        {row}
      </FixedSizeList>
    </VirtualTableContext.Provider>
  );
}

const Inner = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const { header, top, footer } = useContext(VirtualTableContext);
    return (
      <div {...rest} ref={ref}>
        <table
          className={'overflow-hidden text-left'}
          style={{ top, position: 'absolute', width: '100%' }}>
          {header}
          <tbody>{children}</tbody>
          {footer}
        </table>
      </div>
    );
  },
);

function Row({ index, data }: { index: number; data: VirtualTableItemData }) {
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

  if (isFileModel(itemData)) {
    return (
      <TableFileItem
        i={index}
        fileIndex={index - totalFolder}
        selected={selectedFiles}
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
      selected={selectedFolders}
      onSelect={onSelectFolder}
      key={itemData.id}
      folder={itemData}
      outerDisabled
    />
  );
}

export type VirtualTableItemData = {
  folders: FolderModelDTO[];
  files: FileModelDTO[];
  totalFolder: number;
  onSelectFile: (id: string) => void;
  onSelectFolder: (id: string) => void;
  selectedFiles: string[];
  selectedFolders: string[];
};

export function FileTable() {
  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    display,
    viewSettings,
    files,
    folders,
    totalFileSize,
  } = useExplorerData();

  const itemData: VirtualTableItemData = {
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
      <VirtualTable
        height={display.height || 500}
        width={'100%'}
        itemCount={folders.length + files.length}
        itemData={itemData}
        itemSize={FILE_TABLE_ITEM_HEIGHT}
        header={<TableHeader files={files} folders={folders} />}
        row={Row}
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
                <td className={tw(!!viewSettings?.binView && 'pl-4')}>
                  {folders.length} Folders <br />
                  {files.length} Files
                </td>
                <td align={'right'}>{totalFileSize}</td>
                <td />
              </tr>
            </motion.tfoot>
          )
        }
      />
    </PagedWrapper>
  );
}
