import { useUserState } from '../stores/userStore.ts';
import { FileUpload } from './file/fileUpload.tsx';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { FileModel } from '../type/file.ts';
import CreateFolder from './folder/createFolder.tsx';
import { FolderModel } from '../type/folder.ts';

export default function Dashboard() {
  const user = useUserState(s => s.user);

  const files = useQuery({
    queryFn: () =>
      axios.get(BASE_URL + 'auth/file').then(res => res.data as FileModel[]),
    queryKey: ['files', null],
  });

  const folders = useQuery({
    queryFn: () =>
      axios
        .get(BASE_URL + 'auth/folder')
        .then(res => res.data as FolderModel[]),
    queryKey: ['folders', null],
  });

  return (
    <div className={'container'}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div className={'grid grid-cols-3 gap-5'}>
        <FileUpload />
        <CreateFolder />
      </div>
      <ul>
        {folders.data?.map((folder: FolderModel) => (
          <li key={folder.id}>{folder.folder_name}</li>
        ))}
      </ul>
      <ul>
        {files.data?.map((file: FileModel) => (
          <li key={file.id}>{file.file_name}</li>
        ))}
      </ul>
    </div>
  );
}
