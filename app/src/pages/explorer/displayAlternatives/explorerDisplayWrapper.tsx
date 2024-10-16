import { DataOperationType, Selected } from '@models/file.ts';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import useContextMenu, { ContextData } from '@hooks/useContextMenu.ts';
import { DisplayContext } from '@lib/contexts.ts';
import { MultipleActionButton } from '@pages/explorer/components/multipleActionButton.tsx';
import FileDisplay from '@pages/explorer/file/display/fileDisplay.tsx';
import { AnimatePresence } from 'framer-motion';
import { Portal } from 'react-portal';
import ContextMenu, {
  ContextMenuContent,
} from '@components/contextMenu/contextMenu.tsx';
import { prepareSelectRange } from '@pages/explorer/components/rangeSelect.ts';
import ShareModal from '@pages/explorer/components/share/shareModal.tsx';
import {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useShallow } from 'zustand/react/shallow';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export type Vec2 = { x: number; y: number };

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
  const [rangeStart, setRangeStart] = useState<number | undefined>(undefined);
  const [dragged, setDragged] = useState<
    undefined | { type: DataOperationType; id: string }
  >(undefined);
  const displayRef = useRef<HTMLDivElement>(null);

  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    selectNone,
    currentFolder,
    selectedFileIndex,
    setDisplayHeight,
  } = useExplorerStore(
    useShallow(s => ({
      selectedFolders: s.selectedResources.selectedFolders,
      selectedFiles: s.selectedResources.selectedFiles,
      selectFile: s.selectedResources.selectFile,
      selectFolder: s.selectedResources.selectFolder,
      selectNone: s.selectedResources.selectNone,
      currentFolder: s.current.folder,
      selectedFileIndex: s.current.selectedFileIndex,
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
    if (isPartialSelected || isAllSelected) {
      context.setData(selectedData);
    } else {
      context.setData(data);
    }
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
    if (rangeStart !== undefined) {
      handleRangeSelect(rangeStart, index);
    } else {
      setRangeStart(index);
    }
  };

  const handleDrag = (type: DataOperationType, id: string) => {
    setDragged({ type, id });
  };

  useEffect(() => {
    const handleHeight = () => {
      if (displayRef.current) {
        setDisplayHeight(displayRef.current.clientHeight);
      }
    };
    handleHeight();
    window.addEventListener('resize', handleHeight);
    return () => {
      window.removeEventListener('resize', handleHeight);
    };
  }, [setDisplayHeight, displayRef]);

  return (
    <DisplayContext.Provider
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
      }}>
      {!viewSettings?.scrollControlMissing && !viewSettings?.noActions && (
        <MultipleActionButton
          someSelected={isSomeSelected}
          handleClick={handleContext}
        />
      )}
      <div
        ref={displayRef}
        id={'display'}
        className={'h-full flex-grow overflow-x-auto'}
        onContextMenu={e => {
          if (viewSettings?.isCreateAllowed)
            handleContext({ x: e.clientX, y: e.clientY }, 'fileWindow');
        }}>
        <FileUploadContent
          disabled={!viewSettings?.isCreateAllowed}
          folder={currentFolder}
          isInHeader
          className={'h-full'}>
          {children}
        </FileUploadContent>
      </div>
      {!viewSettings?.noDisplay && (
        <FileDisplay
          onSelect={selectFile}
          fileIndex={selectedFileIndex}
          selected={selectedFiles}
          shareUuid={shareUuid}
        />
      )}
      {!shareUuid && <ShareModal />}
      {!viewSettings?.scrollControlMissing && (
        <AnimatePresence>
          {context.clicked && (
            <Portal>
              <ContextMenu
                pos={context.pos}
                onClose={() => context.setClicked(false)}>
                <ContextMenuContent
                  data={context.data}
                  onClose={() => context.setClicked(false)}
                />
              </ContextMenu>
            </Portal>
          )}
        </AnimatePresence>
      )}
    </DisplayContext.Provider>
  );
}
