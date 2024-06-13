import { FolderModel } from '@models/folder.ts';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@lib/classMerge.ts';
import { PermanentDeleteAction } from '@pages/explorer/components/delete';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';

export function FolderItem({
  folder,
  selected,
  onSelect,
}: {
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const isSelected = useMemo(
    () => selected.includes(folder.id),
    [folder.id, selected],
  );

  return (
    <tr
      className={tw(
        'group transition-all [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(folder.id)}
        />
      </th>
      <td className={'!p-0'}>
        <Link
          className={'flex w-full p-3 group-hover:bg-slate-200'}
          to={`/home/folder/${folder.id.toString()}`}>
          {folder.folder_name}
        </Link>
      </td>
      <td align={'right'}></td>
      <td align={'right'}>
        {formatDistanceToNow(folder.updated_at, { addSuffix: true })}
      </td>
      <td align={'right'}>
        <PermanentDeleteAction
          type={'folder'}
          id={folder.id}
          name={folder.folder_name}
        />
        <RenameAction
          type={'folder'}
          id={folder.id}
          name={folder.folder_name}
        />
        <MoveAction
          type={'folder'}
          name={folder.folder_name}
          id={folder.id}
          current_parent={folder.parent_id}
        />
      </td>
    </tr>
  );
}
