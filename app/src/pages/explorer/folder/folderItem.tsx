import { FolderModel } from '../../../../models/folder.ts';
import { Link } from 'react-router-dom';
import { MoveAction } from '../components/move';
import { useMemo } from 'react';
import tw from '../../../lib/classMerge.ts';
import { RenameAction } from '../components/rename';
import { DeleteAction } from '../components/delete';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';

export function FolderItem({
  folder,
  selected,
  onSelect,
}: {
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const isSelected = useMemo(() => selected.includes(folder.id), [selected]);

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
          to={`/home/${folder.id.toString()}`}>
          {folder.folder_name}
        </Link>
      </td>
      <td align={'right'}></td>
      <td align={'right'}>
        {formatDistanceToNow(folder.updated_at, { addSuffix: true })}
      </td>
      <td align={'right'}>
        <DeleteAction
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
