import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { ReactNode } from 'react';
import { useExplorerStore } from '@stores/folderStore.ts';
import useContextMenu, { ContextData } from '@hooks/useContextMenu.ts';
import { Selected } from '@pages/explorer/displayAlternatives/fileTable/fileTable.tsx';
import { DisplayContext } from '@lib/contexts.ts';
import { MultipleActionButton } from '@pages/explorer/components/multipleActionButton.tsx';
import FileDisplay from '@pages/explorer/file/display/fileDisplay.tsx';
import { AnimatePresence } from 'framer-motion';
import { Portal } from 'react-portal';
import ContextMenu, { ContextMenuContent } from '@components/contextMenu.tsx';

export type Vec2 = { x: number; y: number };

export function ExplorerDisplayWrapper({
  files,
  folders,
  children,
}: {
  files: FileModel[];
  folders: FolderModel[];
  children: ReactNode;
}) {
  const { selectedFile: selectedDisplayFile } = useExplorerStore(
    s => s.current,
  );
  const { selectedFolders, selectedFiles, selectFile } = useExplorerStore(
    s => s.selectedResources,
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

  return (
    <DisplayContext.Provider value={{ handleContext, files, folders }}>
      <MultipleActionButton
        someSelected={isSomeSelected}
        handleClick={handleContext}
      />
      <div id={'display'}>{children}</div>
      <FileDisplay
        onSelect={selectFile}
        file={selectedDisplayFile}
        isSelected={
          !!(
            selectedDisplayFile &&
            selectedFiles.includes(selectedDisplayFile?.id)
          )
        }
      />
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
    </DisplayContext.Provider>
  );
}
