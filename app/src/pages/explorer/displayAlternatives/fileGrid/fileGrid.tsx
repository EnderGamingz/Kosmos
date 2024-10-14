import { useKeyStore } from '@stores/keyStore.ts';
import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import GridFileItem from '@pages/explorer/file/gridFileItem.tsx';
import { DetailType } from '@stores/preferenceStore.ts';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { FileGridSort } from '@pages/explorer/displayAlternatives/fileGrid/fileGridSort.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/pagedWrapper.tsx';
import useExplorerData from '@pages/explorer/displayAlternatives/useExplorerData.ts';
import { containerVariant } from '@components/defaults/transition.ts';
import GridFolderItem from '@pages/explorer/folder/gridFolderItem.tsx';
import {
  createContext,
  forwardRef,
  HTMLProps,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import {
  FILE_GRID_ROW_HEIGHT_COMPACT,
  FILE_GRID_ROW_HEIGHT_DEFAULT,
} from '@lib/constants.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

function Footer(props: {
  fileModels: FileModelDTO[];
  folderModels: FolderModelDTO[];
  totalFileSize: string;
}) {
  return (
    <>
      {!props.fileModels.length && !props.folderModels.length ? (
        <EmptyList grid />
      ) : (
        <motion.div
          className={tw(
            'w-full cursor-default select-none border-none text-sm text-stone-500/50',
            'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-7',
            'flex gap-5 pb-28 pt-4',
            'dark:text-stone-400',
          )}>
          <div>
            {props.folderModels.length} Folders <br />
            {props.fileModels.length} Files
          </div>
          <div>{props.totalFileSize}</div>
        </motion.div>
      )}
    </>
  );
}

function FolderGrid(props: {
  control: boolean;
  folderModels: FolderModelDTO[];
  onSelect: (folder: FolderModelDTO) => void;
  selected: FolderModelDTO[];
  outerDisabled?: boolean;
}) {
  if (!props.folderModels.length) return null;
  const selectedIds = props.selected.map(folder => folder.id);
  return (
    <motion.div
      variants={containerVariant()}
      initial={'hidden'}
      animate={'show'}
      className={tw(
        'mb-5 flex gap-3 overflow-x-auto py-2 md:grid',
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        'xl:grid-cols-5 2xl:grid-cols-7',
        props.control && '[&>div]:cursor-copy',
      )}>
      {props.folderModels.map((folder, i) => (
        <GridFolderItem
          key={folder.id}
          folder={folder}
          index={i}
          onSelect={props.onSelect}
          selected={selectedIds}
          outerDisabled={props.outerDisabled}
        />
      ))}
    </motion.div>
  );
}

export default function FileGrid({
  dynamic,
  details,
}: {
  dynamic?: boolean;
  details: DetailType;
}) {
  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    viewSettings,
    files,
    folders,
    totalFileSize,
    shareUuid,
  } = useExplorerData();
  const isControl = useKeyStore(s => s.keys.ctrl);

  return (
    <PagedWrapper height={!dynamic} viewSettings={viewSettings}>
      <div className={'flex h-full flex-col px-5 md:py-2'}>
        <div className={'mb-[12px] flex items-center gap-2'}>
          {!viewSettings?.noSelect && (
            <SelectAllCheckBox files={files} folders={folders} />
          )}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={'text-sm text-stone-500'}>
            {folders.length} Folders &bull; {files.length} Files
          </motion.p>
          {!viewSettings?.limitedView && !shareUuid && <FileGridSort />}
        </div>
        {dynamic && (
          <FolderGrid
            control={isControl}
            folderModels={folders}
            onSelect={selectFolder}
            selected={selectedFolders}
          />
        )}
        <motion.div
          className={tw(
            'flex-grow',
            Boolean(dynamic) && 'mt-6 gap-3',
            !!viewSettings?.limitedView && 'mt-3',
            Boolean(isControl) && '[&>div]:cursor-copy',
          )}>
          {!dynamic ? (
            <VirtualFileGrid
              files={files}
              folderLength={folders.length}
              selectedFiles={selectedFiles}
              details={details}
              selectFile={selectFile}
              folders={folders}
              selectFolder={selectFolder}
              selectedFolders={selectedFolders}
              totalFileSize={totalFileSize}
              isControl={isControl}
            />
          ) : (
            <ResponsiveMasonry
              columnsCountBreakPoints={{
                320: 1,
                440: 2,
                768: 3,
                1024: 4,
                1280: 5,
                1536: 7,
              }}>
              <Masonry gutter={'0.75rem'}>
                {files.map((file, i) => (
                  <GridFileItem
                    key={file.id}
                    file={file}
                    index={folders.length + i}
                    fileIndex={i}
                    onSelect={selectFile}
                    selected={selectedFiles.map(file => file.id)}
                    dynamic={dynamic}
                    details={details}
                  />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
          {dynamic && (
            <Footer
              fileModels={files}
              folderModels={folders}
              totalFileSize={totalFileSize}
            />
          )}
        </motion.div>
      </div>
    </PagedWrapper>
  );
}

const VirtualGridContext = createContext<{
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

function VirtualGrid({
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
    <VirtualGridContext.Provider value={{ top, setTop, header, footer }}>
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
    </VirtualGridContext.Provider>
  );
}

const Inner = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const { header, top, footer } = useContext(VirtualGridContext);
    return (
      <div {...rest} ref={ref}>
        <div
          className={'overflow-hidden text-left'}
          style={{ top, position: 'absolute', width: '100%' }}>
          {header}
          {children}
          {footer}
        </div>
      </div>
    );
  },
);

function Row({ index, data }: { index: number; data: VirtualGridRowData }) {
  const { columnCount, selectedFiles, onSelectFile, details, folderLength } =
    data;
  const files = data.rows[index];
  return (
    <div
      className={'grid gap-1.5 p-1'}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}>
      {files.map((file, j) => (
        <GridFileItem
          key={file.id}
          file={file}
          index={index * columnCount + j + folderLength}
          fileIndex={index * columnCount + j}
          onSelect={onSelectFile}
          selected={selectedFiles.map(file => file.id)}
          details={details}
          outerDisabled
        />
      ))}
    </div>
  );
}

export type VirtualGridRowData = {
  rows: FileModelDTO[][];
  onSelectFile: (file: FileModelDTO) => void;
  selectedFiles: FileModelDTO[];
  columnCount: number;
  details: DetailType;
  folderLength: number;
};

function VirtualFileGrid({
  folders,
  files,
  folderLength,
  selectFile,
  selectFolder,
  selectedFiles,
  selectedFolders,
  details,
  totalFileSize,
  isControl,
}: {
  files: FileModelDTO[];
  folderLength: number;
  selectFile: (file: FileModelDTO) => void;
  selectedFiles: FileModelDTO[];
  details: DetailType;
  selectFolder: (folder: FolderModelDTO) => void;
  selectedFolders: FolderModelDTO[];
  folders: FolderModelDTO[];
  totalFileSize: string;
  isControl: boolean;
}) {
  const innerContainer = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(7);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (innerContainer.current) {
        const width = innerContainer.current.offsetWidth;
        if (width < 320) setColumnCount(1);
        else if (width < 440) setColumnCount(2);
        else if (width < 768) setColumnCount(3);
        else if (width < 1024) setColumnCount(4);
        else if (width < 1280) setColumnCount(5);
        else setColumnCount(6);
        setContainerHeight(innerContainer.current.offsetHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fileRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < Math.ceil(files.length / columnCount); i++) {
      rows.push(files.slice(i * columnCount, i * columnCount + columnCount));
    }
    return rows;
  }, [columnCount, files]);

  const itemData: VirtualGridRowData = {
    rows: fileRows,
    onSelectFile: selectFile,
    selectedFiles,
    columnCount,
    details,
    folderLength,
  };

  return (
    <div className={'h-full'} ref={innerContainer}>
      <VirtualGrid
        height={containerHeight}
        itemCount={fileRows.length}
        itemSize={
          details === DetailType.Default
            ? FILE_GRID_ROW_HEIGHT_DEFAULT
            : FILE_GRID_ROW_HEIGHT_COMPACT
        }
        width={'100%'}
        itemData={itemData}
        row={Row}
        header={
          <FolderGrid
            control={isControl}
            folderModels={folders}
            onSelect={selectFolder}
            selected={selectedFolders}
            outerDisabled
          />
        }
        footer={
          <Footer
            fileModels={files}
            folderModels={folders}
            totalFileSize={totalFileSize}
          />
        }
      />
    </div>
  );
}
