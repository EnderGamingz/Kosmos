import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import { Checkbox } from '@nextui-org/react';

export function SelectAllCheckBox({
  files,
  folders,
}: {
  files: FileModel[];
  folders: FolderModel[];
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
