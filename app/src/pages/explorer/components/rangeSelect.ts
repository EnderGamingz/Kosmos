import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

type SelectionResult = { files: FileModelDTO[]; folders: FolderModelDTO[] };

export function prepareSelectRange(
  files: FileModelDTO[],
  folders: FolderModelDTO[],
  start: number,
  end: number,
): SelectionResult {
  const combinedList = [...folders, ...files];
  const foldersEnd = folders.length;
  const selected: SelectionResult = { files: [], folders: [] };

  // Flip start and end if selection is backwards
  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  for (let i = start; i <= end; i++) {
    if (i < foldersEnd) {
      selected.folders.push(<FolderModelDTO>combinedList[i]);
    } else {
      selected.files.push(<FileModelDTO>combinedList[i]);
    }
  }

  return selected;
}
