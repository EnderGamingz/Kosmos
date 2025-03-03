import { useExplorerStore } from '@stores/explorerStore.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { Checkbox } from '@/components/ui/checkbox';

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
      files.map(file => selectFile(file));
      folders.map(folder => selectFolder(folder));
    } else if (isAllSelected) {
      selectNone();
    }
  };

  return (
    <Checkbox
      checked={
        isAllSelected && hasData
          ? true
          : isPartialSelected
            ? 'indeterminate'
            : false
      }
      onClick={toggleSelection}
    />
  );
}
