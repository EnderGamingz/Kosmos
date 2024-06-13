import { FileModel, normalizeFileType } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@lib/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import { MoveToTrash } from '@pages/explorer/components/delete';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';

export function FileItem({
  file,
  selected,
  onSelect,
  onContext,
}: {
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
  onContext: (file: FileModel, pos: { x: number; y: number }) => void;
}) {
  const isSelected = selected.includes(file.id);
  return (
    <tr
      onContextMenu={e => {
        e.preventDefault();
        onContext(file, {
          x: e.clientX,
          y: e.clientY,
        });
      }}
      className={tw(
        'group [&_td]:p-2 [&_th]:p-2',
        isSelected && 'bg-indigo-100',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(file.id)}
        />
      </th>
      <td className={'!p-0'}>
        <div className={'flex'}>
          <ItemIcon
            name={file.file_name}
            type={normalizeFileType(file.file_type)}
            id={file.id}
          />
          <p
            className={
              'w-64 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap p-2'
            }>
            {file.file_name}
          </p>
        </div>
      </td>
      <td align={'right'}>{formatBytes(file.file_size)}</td>
      <td align={'right'}>
        {formatDistanceToNow(file.updated_at, { addSuffix: true })}
      </td>
      <td align={'right'}>
        <div className={'grid [&>*]:text-left'}>
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
        </div>
      </td>
    </tr>
  );
}
