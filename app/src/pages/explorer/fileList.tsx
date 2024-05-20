import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { FileModel } from '../../../models/file.ts';
import { FolderModel, FolderResponse } from '../../../models/folder.ts';
import { useMemo } from 'react';
import BreadCrumbs, { BreadCrumb } from '../../components/BreadCrumbs.tsx';
import { FolderItem } from './folder/folderItem.tsx';
import { FileItem } from './file/fileItem.tsx';

export function FileList() {
  const { folder } = useParams();

  const files = useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all${folder ? `/${folder}` : ''}`)
        .then(res => res.data as FileModel[]),
    queryKey: ['files', folder],
  });

  const folders = useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/folder/all${folder ? `/${folder}` : ''}`)
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
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </ul>
      <ul>
        {files.data?.map((file: FileModel) => (
          <FileItem key={file.id} file={file} />
        ))}
      </ul>
    </>
  );
}
