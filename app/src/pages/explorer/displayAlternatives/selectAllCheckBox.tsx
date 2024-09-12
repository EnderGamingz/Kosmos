import { useExplorerStore } from '@stores/explorerStore.ts';
import { Checkbox } from '@nextui-org/react';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export function SelectAllCheckBox({
  files,
  folders,
}: {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
}) {
  const {
    selectedFolders,
    selectedFiles,
    selectNone,
    selectFile,
    selectFolder,
  } = useExplorerStore(s => s.selectedResources);

  const isAllSelected =
    selectedFolders.length === folders.length &&
    selectedFiles.length === files?.length;

  const isNoneSelected = !selectedFiles.length && !selectedFolders.length;
  const isPartialSelected = !isAllSelected && !isNoneSelected;
  const hasData = !!folders.length || !!files.length;

  const toggleSelection = () => {
    if ((!isNoneSelected && !isAllSelected) || isNoneSelected) {
      selectNone();
      files.map(file => selectFile(file.id));
      folders.map(folder => selectFolder(folder.id));
    } else if (isAllSelected) {
      selectNone();
    }
  };

  return (
    <Checkbox
      isSelected={isAllSelected && hasData}
      isIndeterminate={isPartialSelected}
      onChange={toggleSelection}
    />
  );
}
