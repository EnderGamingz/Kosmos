import { BASE_URL } from '../../../vars.ts';
import { useMemo } from 'react';
import { DeleteAction } from '../components/delete.tsx';
import { MoveAction } from '../components/move';
import {
  FileModel,
  FileType,
  getFileTypeById,
} from '../../../../models/file.ts';
import { DownloadSingleAction } from '../components/download.tsx';
import tw from '../../../lib/classMerge.ts';
import { RenameAction } from '../components/rename';

export function FileItem({
  file,
  selected,
  onSelect,
}: {
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const isSelected = useMemo(() => selected.includes(file.id), [selected]);

  return (
    <li
      className={tw(
        'flex items-center justify-between',
        isSelected && 'bg-indigo-100',
      )}>
      <input
        type={'checkbox'}
        checked={isSelected}
        onChange={() => onSelect(file.id)}
      />
      {[FileType.Image, FileType.RawImage].some(
        x => x === getFileTypeById(file.file_type),
      ) && (
        <img
          className={'aspect-square h-20 object-cover'}
          src={`${BASE_URL}auth/file/image/${file.id}/0`}
          alt={file.file_name}
        />
      )}
      <p
        className={
          'max-w-72 overflow-hidden overflow-ellipsis whitespace-nowrap'
        }>
        {file.file_name}
      </p>
      <div>
        <DownloadSingleAction
          type={'file'}
          id={file.id}
          name={file.file_name}
        />
        <DeleteAction type={'file'} id={file.id} />
        <RenameAction type={'file'} id={file.id} name={file.file_name} />
        <MoveAction
          type={'file'}
          name={file.file_name}
          id={file.id}
          current_parent={file.parent_folder_id}
        />
      </div>
    </li>
  );
}
