import { FolderModel } from '../../type/folder.ts';
import { Link } from 'react-router-dom';

export function FolderItem({ folder }: { folder: FolderModel }) {
  return (
    <li>
      <Link to={`/home/${folder.id.toString()}`}>{folder.folder_name}</Link>
    </li>
  );
}
