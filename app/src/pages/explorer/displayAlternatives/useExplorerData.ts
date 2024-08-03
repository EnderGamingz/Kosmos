import { useExplorerStore } from '@stores/explorerStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useFormatBytes } from '@utils/fileSize.ts';

export default function useExplorerData() {
  const { selectedFolders, selectedFiles, selectFile, selectFolder, display } =
    useExplorerStore(
      useShallow(s => ({
        selectedFolders: s.selectedResources.selectedFolders,
        selectedFiles: s.selectedResources.selectedFiles,
        selectFile: s.selectedResources.selectFile,
        selectFolder: s.selectedResources.selectFolder,
        display: s.display,
      })),
    );

  const { viewSettings, files, folders, shareUuid } =
    useContext(DisplayContext);

  const totalFileSize = useFormatBytes(
    files.reduce((a, b) => a + b.file_size, 0),
  );
  return {
    selectedFolders,
    selectedFiles,
    selectFile,
    selectFolder,
    display,
    viewSettings,
    files,
    folders,
    totalFileSize,
    shareUuid,
  };
}
