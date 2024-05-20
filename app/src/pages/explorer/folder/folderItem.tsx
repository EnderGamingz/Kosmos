import { FolderModel } from '../../../../models/folder.ts';
import { Link } from 'react-router-dom';
import { DeleteAction } from '../components/delete.tsx';
import { MoveAction } from '../components/move.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';

export function FolderItem({ folder }: { folder: FolderModel }) {
  const testDownload = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        BASE_URL + 'auth/download/multi',
        {
          files: [],
          folders: [folder.id],
        },
        { responseType: 'blob' },
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `Kosmos_Archive_${new Date().toLocaleString('de-de', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}.zip`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
  return (
    <li className={'flex items-center justify-between'}>
      <Link to={`/home/${folder.id.toString()}`}>{folder.folder_name}</Link>
      <div>
        <button onClick={() => testDownload.mutate()}>Test Download</button>
        <DeleteAction type={'folder'} id={folder.id} />
        <MoveAction type={'folder'} id={folder.id} destination={null} />
      </div>
    </li>
  );
}
