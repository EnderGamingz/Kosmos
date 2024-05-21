import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { FileModel } from '../../../models/file.ts';
import { FolderModel, FolderResponse } from '../../../models/folder.ts';
import { useMemo, useState } from 'react';
import BreadCrumbs, { BreadCrumb } from '../../components/BreadCrumbs.tsx';
import { FolderItem } from './folder/folderItem.tsx';
import { FileItem } from './file/fileItem.tsx';

export function FileList() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
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

  const testDownload = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        BASE_URL + 'auth/download/multi',
        {
          files: selectedFiles,
          folders: selectedFolders,
        },
        {
          responseType: 'blob',
          withCredentials: true,
          onDownloadProgress: progressEvent => {
            const percentCompleted = Math.floor(
              (progressEvent.loaded * 100) / (progressEvent.total || 100),
            );
            console.log(`Download Progress: ${percentCompleted}%`); // you can play around with this line of code depending on how you want to display this progress
          },
        },
      );

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'archive.zip';
      if (contentDisposition) {
        fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  const crumbs = useMemo(() => {
    const arr = [{ name: 'Home', href: folder && '/home' }] as BreadCrumb[];
    if (folder && folders.data)
      arr.push({ name: folders.data.folder.folder_name });
    return arr;
  }, [folder, folders]);

  const handleFolderSelect = (id: string) => {
    if (!selectedFolders.includes(id)) {
      setSelectedFolders(prev => [...prev, id]);
    } else {
      setSelectedFolders(prev => prev.filter(x => x !== id));
    }
  };

  const handleFileSelect = (id: string) => {
    if (!selectedFiles.includes(id)) {
      setSelectedFiles(prev => [...prev, id]);
    } else {
      setSelectedFiles(prev => prev.filter(x => x !== id));
    }
  };

  return (
    <>
      <BreadCrumbs crumbs={crumbs} />
      <button
        className={'disabled:bg-gray-400'}
        onClick={() => testDownload.mutate()}
        disabled={!selectedFiles.length && !selectedFolders.length}>
        Multi Download
      </button>
      <ul>
        {folders.data?.folders.map((folder: FolderModel) => (
          <FolderItem
            selected={selectedFolders}
            onSelect={handleFolderSelect}
            key={folder.id}
            folder={folder}
          />
        ))}
      </ul>
      <ul>
        {files.data?.map((file: FileModel) => (
          <FileItem
            selected={selectedFiles}
            onSelect={handleFileSelect}
            key={file.id}
            file={file}
          />
        ))}
      </ul>
    </>
  );
}
