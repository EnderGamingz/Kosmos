import { FileModel, normalizeFileType } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@lib/fileSize.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';

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
        <div className={'grid [&>*]:text-left'}></div>
      </td>
    </tr>
  );
}
