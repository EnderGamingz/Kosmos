import { SelectedResources } from '@stores/explorerStore.ts';
import { MultiMoveData } from '@pages/explorer/components/move/moveModalContent.tsx';

export function getMultiMoveBySelected(
  selectedResources: SelectedResources,
): MultiMoveData | undefined {
  if (
    !selectedResources.selectedFiles.length &&
    !selectedResources.selectedFolders.length
  )
    return undefined;

  return {
    files: selectedResources.selectedFiles,
    folders: selectedResources.selectedFolders,
  };
}
