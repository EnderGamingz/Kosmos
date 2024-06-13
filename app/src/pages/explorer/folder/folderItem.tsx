import { FolderModel } from '@models/folder.ts';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@lib/classMerge.ts';
import { Bars3Icon } from '@heroicons/react/24/outline';

export function FolderItem({
  folder,
  selected,
  onSelect,
  onContext,
}: {
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
  onContext: (folder: FolderModel, pos: { x: number; y: number }) => void;
}) {
  const isSelected = useMemo(
    () => selected.includes(folder.id),
    [folder.id, selected],
  );

  return (
    <tr
      onContextMenu={e => {
        e.preventDefault();
        onContext(folder, { x: e.clientX, y: e.clientY });
      }}
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
      <td align={'right'} className={'!p-0'}>
        <button
          onClick={e => {
            onContext(folder, { x: e.clientX, y: e.clientY });
          }}
          className={'cursor-pointer p-2'}>
          <Bars3Icon className={'h-6 w-6'} />
        </button>
      </td>
    </tr>
  );
}
