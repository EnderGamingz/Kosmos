import { FolderModel } from '../../../../models/folder.ts';
import { Link } from 'react-router-dom';
import { DeleteAction } from '../components/delete.tsx';
import { MoveAction } from '../components/move/move.tsx';
import { useMemo } from 'react';
import tw from '../../../lib/classMerge.ts';

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
    <li
      className={tw(
        'flex items-center justify-between',
        isSelected && 'bg-indigo-100',
      )}>
      <input
        type={'checkbox'}
        checked={isSelected}
        onChange={() => onSelect(folder.id)}
      />
      <Link to={`/home/${folder.id.toString()}`}>{folder.folder_name}</Link>
      <div>
        <DeleteAction type={'folder'} id={folder.id} />
        <MoveAction
          type={'folder'}
          name={folder.folder_name}
          id={folder.id}
          current_parent={folder.parent_id}
        />
      </div>
    </li>
  );
}
