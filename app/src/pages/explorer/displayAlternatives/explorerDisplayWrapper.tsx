import { DataOperationType, FileModel, Selected } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { ReactNode, useState } from 'react';
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

export type Vec2 = { x: number; y: number };

export function ExplorerDisplayWrapper({
  files,
  folders,
  children,
  shareUuid,
  viewSettings,
  overwriteDisplay,
}: {
  files: FileModel[];
  folders: FolderModel[];
  children: ReactNode;
  shareUuid?: string;
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
}) {
  const [rangeStart, setRangeStart] = useState<number | undefined>(undefined);
  const [dragged, setDragged] = useState<
    undefined | { type: DataOperationType; id: string }
  >(undefined);
  const selectedFileIndex = useExplorerStore(s => s.current.selectedFileIndex);

  const {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    selectNone,
  } = useExplorerStore(s => s.selectedResources);

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
      toSelect.folders.forEach(selectFolder);
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
      {!viewSettings?.scrollControlMissing && (
        <MultipleActionButton
          someSelected={isSomeSelected}
          handleClick={handleContext}
        />
      )}
      <div id={'display'} className={'h-full flex-grow overflow-x-auto'}>
        {children}
      </div>
      <FileDisplay
        onSelect={selectFile}
        fileIndex={selectedFileIndex}
        selected={selectedFiles}
        shareUuid={shareUuid}
      />
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
