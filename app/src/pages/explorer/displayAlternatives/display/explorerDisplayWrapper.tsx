import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { DataOperationType, Selected } from '@models/file.ts';
import { DisplayContext } from '@lib/contexts.ts';
import type { ListOnScrollProps } from 'react-window';
import type { Vec2 } from '@/types/vec2.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import type {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/display/types.ts';
import { calculateDisplayHeight } from '@pages/explorer/displayAlternatives/calculateDisplayHeight.ts';
import { prepareSelectRange } from '@pages/explorer/components/rangeSelect.ts';
import useContextMenu, { type ContextData } from '@hooks/useContextMenu.ts';
import useLayoutOptions from '@hooks/useLayoutOptions.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';

import FileUploader from '@pages/explorer/components/upload/fileUploader.tsx';
import FileListFab from '@pages/explorer/fileListFab.tsx';
import ShareModal from '@pages/explorer/components/share/shareModal.tsx';
import ContextMenuHandler from '@pages/explorer/displayAlternatives/display/contextMenuHandler.tsx';
import MultipleActionButton from '@pages/explorer/components/multipleActionButton.tsx';

// Very large component
const FileDisplay = lazy(
  () => import('@pages/explorer/file/display/fileDisplay.tsx'),
);

export function ExplorerDisplayWrapper({
  files,
  folders,
  children,
  shareUuid,
  viewSettings,
  overwriteDisplay,
}: {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
  children: ReactNode;
  shareUuid?: string;
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
}) {
  const [showFab, setShowFab] = useState(false);
  const [rangeStart, setRangeStart] = useState<number | undefined>(undefined);
  const [dragged, setDragged] = useState<
    undefined | { type: DataOperationType; id: string }
  >(undefined);
  const { isMobile } = useLayoutOptions();

  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    selectNone,
    currentFolder,
    setDisplayHeight,
  } = useExplorerStore(
    useShallow(s => ({
      selectedFolders: s.selectedResources.selectedFolders,
      selectedFiles: s.selectedResources.selectedFiles,
      selectFile: s.selectedResources.selectFile,
      selectFolder: s.selectedResources.selectFolder,
      selectNone: s.selectedResources.selectNone,
      currentFolder: s.current.folder,
      setDisplayHeight: s.display.setHeight,
    })),
  );

  const isNoneSelected = !selectedFiles.length && !selectedFolders.length;
  const isAllSelected =
    selectedFolders.length === folders.length &&
    selectedFiles.length === files?.length;
  const hasData = !!folders.length || !!files.length;
  const isSomeSelected = !isNoneSelected && hasData;
  const isPartialSelected = !isAllSelected && !isNoneSelected;

  const context = useContextMenu();

  const selectedData: Selected = {
    folders: selectedFolders,
    files: selectedFiles,
  };

  const handleContext = (pos: Vec2, data?: ContextData) => {
    context.setPos({ x: pos.x, y: pos.y });
    context.setClicked(true);
    if (isPartialSelected || isAllSelected) context.setData(selectedData);
    else context.setData(data);
  };

  const handleRangeSelect = (start?: number, end?: number) => {
    if (end === undefined) setRangeStart(start);
    if (start !== undefined && end !== undefined) {
      selectNone();
      const toSelect = prepareSelectRange(files, folders, start, end);
      if (!viewSettings?.selectDisable?.folders)
        toSelect.folders.forEach(selectFolder);
      if (!viewSettings?.selectDisable?.files)
        toSelect.files.forEach(selectFile);
      setRangeStart(undefined);
    }
  };

  const handleRangeChange = (index: number) => {
    if (rangeStart !== undefined) handleRangeSelect(rangeStart, index);
    else setRangeStart(index);
  };

  const handleDrag = (type: DataOperationType, id: string) =>
    setDragged({ type, id });

  useEffect(() => {
    const handleHeight = () => {
      setDisplayHeight(
        calculateDisplayHeight(
          isMobile,
          viewSettings?.additionalHeightReduction,
        ),
      );
    };
    handleHeight();
    window.addEventListener('resize', handleHeight);
    return () => window.removeEventListener('resize', handleHeight);
  }, [setDisplayHeight, isMobile, viewSettings?.additionalHeightReduction]);

  const handleScroll = (props: ListOnScrollProps) => {
    if (props.scrollDirection === 'forward' && props.scrollOffset === 0)
      setShowFab(true);

    if (props.scrollDirection === 'backward') setShowFab(true);
    else if (props.scrollDirection === 'forward' && props.scrollOffset !== 0)
      setShowFab(false);
  };

  return (
    <DisplayContext
      value={{
        viewSettings,
        overwriteDisplay,
        handleContext,
        files,
        folders,
        dragMove: {
          dragged: dragged?.type,
          id: dragged?.id,
          setDrag: handleDrag,
          resetDrag: () => setDragged(undefined),
        },
        select: { setRange: handleRangeChange, rangeStart },
        // Share Uuid in the context implies that this component is used in a folder share
        shareUuid: shareUuid,
        onScroll: handleScroll,
      }}
    >
      {!viewSettings?.scrollControlMissing && !viewSettings?.noActions && (
        <MultipleActionButton
          someSelected={isSomeSelected}
          handleClick={handleContext}
        />
      )}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: This div is meant to be interactive and is handled with onContextMenu event. */}
      <div
        id={'display'}
        className={
          'h-0 grow overflow-x-auto flex flex-col animate-fade-in duration-200'
        }
        onContextMenu={e => {
          if (viewSettings?.isCreateAllowed)
            handleContext({ x: e.clientX, y: e.clientY }, 'fileWindow');
        }}
      >
        <FileUploader
          disabled={!viewSettings?.isCreateAllowed}
          folder={currentFolder}
          isInList
          className={'h-full'}
        >
          {children}
        </FileUploader>
      </div>
      {viewSettings?.isCreateAllowed && <FileListFab hide={!showFab} />}
      <Suspense>
        {!viewSettings?.noDisplay && (
          <FileDisplay
            onSelect={selectFile}
            selected={selectedFiles}
            shareUuid={shareUuid}
          />
        )}
      </Suspense>
      {!shareUuid && <ShareModal />}
      <ContextMenuHandler
        key={'context-menu'}
        scrollControlMissing={viewSettings?.scrollControlMissing}
        context={context}
        onClose={() => context.setClicked(false)}
      />
    </DisplayContext>
  );
}
