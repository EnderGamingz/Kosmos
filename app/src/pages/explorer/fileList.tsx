import { useParams } from 'react-router-dom';
import { FileModel } from '../../../models/file.ts';
import { FolderModel } from '../../../models/folder.ts';
import { useMemo, useState } from 'react';
import BreadCrumbs, { BreadCrumb } from '../../components/BreadCrumbs.tsx';
import { FolderItem } from './folder/folderItem.tsx';
import { FileItem } from './file/fileItem.tsx';
import { MultiDownload } from './components/multiDownload.tsx';
import { useFiles, useFolders } from '../../lib/query.ts';

export function FileList() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const { folder } = useParams();

  const files = useFiles(folder);
  const folders = useFolders(folder);

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
      <MultiDownload files={selectedFiles} folders={selectedFolders} />
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
