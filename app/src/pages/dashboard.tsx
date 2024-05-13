import { FileUpload } from './file/fileUpload.tsx';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { FileModel } from '../type/file.ts';
import CreateFolder from './folder/createFolder.tsx';
import { FolderModel, FolderResponse } from '../type/folder.ts';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useEnsureLoggedIn } from '../auth';
import BreadCrumbs, { BreadCrumb } from '../components/BreadCrumbs.tsx';
import { useMemo } from 'react';

export function FileList() {
  const { folder } = useParams();

  const files = useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all${folder ? '/' + folder : ''}`)
        .then(res => res.data as FileModel[]),
    queryKey: ['files', folder],
  });

  const folders = useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/folder/all${folder ? '/' + folder : ''}`)
        .then(res => res.data as FolderResponse),
    queryKey: ['folders', folder],
  });

  const crumbs = useMemo(() => {
    const arr = [{ name: 'Home', href: folder && '/home' }] as BreadCrumb[];
    if (folder && folders.data)
      arr.push({ name: folders.data.folder.folder_name });
    return arr;
  }, [folder, folders]);

  return (
    <>
      <BreadCrumbs crumbs={crumbs} />
      <ul>
        {folders.data?.folders.map((folder: FolderModel) => (
          <li key={folder.id}>
            <Link to={`/home/${folder.id.toString()}`}>
              {folder.folder_name}
            </Link>
          </li>
        ))}
      </ul>
      <ul>
        {files.data?.map((file: FileModel) => (
          <li key={file.id}>{file.file_name}</li>
        ))}
      </ul>
    </>
  );
}

export default function Dashboard() {
  const user = useEnsureLoggedIn();

  return (
    <div className={'container'}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div className={'grid grid-cols-3 gap-5'}>
        <FileUpload />
        <CreateFolder />
      </div>
      <Outlet />
    </div>
  );
}
