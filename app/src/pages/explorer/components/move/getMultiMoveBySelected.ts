import type { SelectedResources } from '@stores/explorerStore.ts';
import type { MultiMoveData } from '@pages/explorer/components/move/moveModalContent.tsx';

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
