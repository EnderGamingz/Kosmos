import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

type SelectionResult = { files: string[]; folders: string[] };

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
      selected.folders.push(combinedList[i].id);
    } else {
      selected.files.push(combinedList[i].id);
    }
  }

  return selected;
}
