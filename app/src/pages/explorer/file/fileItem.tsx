import { useMemo } from 'react';
import { MoveAction } from '../components/move';
import { FileModel, getFileType } from '../../../../models/file.ts';
import { DownloadSingleAction } from '../components/download.tsx';
import tw from '../../../lib/classMerge.ts';
import { RenameAction } from '../components/rename';
import { MoveToTrash } from '../components/delete';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '../../../lib/fileSize.ts';
import { BASE_URL } from '../../../vars.ts';

export function FileItem({
  file,
  selected,
  onSelect,
}: {
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const isSelected = useMemo(
    () => selected.includes(file.id),
    [file.id, selected],
  );

  return (
    <tr
      className={tw(
        'group [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
        />
      </th>
      <td>
        {['Image', 'Raw Image'].some(
          x => x === getFileType(file.file_type),
        ) && (
          <img
            loading={'lazy'}
            className={'aspect-square h-20 object-cover'}
            src={`${BASE_URL}auth/file/image/${file.id}/0`}
            alt={file.file_name}
          />
        )}
        <p className={'overflow-hidden overflow-ellipsis whitespace-nowrap'}>
          {file.file_name}
        </p>
      </td>
      <td align={'right'}>{formatBytes(file.file_size)}</td>
      <td align={'right'}>
        {formatDistanceToNow(file.updated_at, { addSuffix: true })}
      </td>
      <td align={'right'}>
        <DownloadSingleAction
          type={'file'}
          id={file.id}
          name={file.file_name}
        />
        {/*        <PermanentDeleteAction
          type={'file'}
          id={file.id}
          name={file.file_name}
        />*/}
        <MoveToTrash id={file.id} />
        <RenameAction type={'file'} id={file.id} name={file.file_name} />
        <MoveAction
          type={'file'}
          name={file.file_name}
          id={file.id}
          current_parent={file.parent_folder_id}
        />
      </td>
    </tr>
  );
}
