import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import BreadCrumbs, { BreadCrumb } from '../../components/BreadCrumbs.tsx';
import { MultiDownload } from './components/multiDownload.tsx';
import { useFiles, useFolders } from '../../lib/query.ts';
import { FolderModel } from '../../../models/folder.ts';
import { FolderItem } from './folder/folderItem.tsx';
import { FileModel } from '../../../models/file.ts';
import { FileItem } from './file/fileItem.tsx';
import { Checkbox } from '@nextui-org/react';

export function FileList() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const { folder } = useParams();

  useEffect(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
  }, [folder]);

  const files = useFiles(folder);
  const folders = useFolders(folder);

  const crumbs = useMemo(() => {
    const arr = [{ name: 'Home', href: folder && '/home' }] as BreadCrumb[];
    if (folder && folders.data)
      arr.push({ name: folders.data.folder?.folder_name || 'Folder' });
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

  const isAllSelected =
    selectedFolders.length === folders.data?.folders.length &&
    selectedFiles.length === files.data?.length;

  const isNoneSelected = !selectedFiles.length && !selectedFolders.length;
  return (
    <>
      <BreadCrumbs crumbs={crumbs} />
      <MultiDownload files={selectedFiles} folders={selectedFolders} />
      <table className={'w-full table-auto text-left'}>
        <thead>
          <tr className={'[&_th]:p-3'}>
            <th>
              <Checkbox
                isSelected={isAllSelected}
                isIndeterminate={!isAllSelected && !isNoneSelected}
                onValueChange={() => {
                  if ((!isNoneSelected && !isAllSelected) || isNoneSelected) {
                    setSelectedFolders(
                      folders.data?.folders.map(folder => folder.id) || [],
                    );
                    setSelectedFiles(files.data?.map(file => file.id) || []);
                  } else if (isAllSelected) {
                    setSelectedFiles([]);
                    setSelectedFolders([]);
                  }
                }}
              />
            </th>
            <th>Name</th>
            <th align={'center'}>Size</th>
            <th align={'center'}>Added</th>
            <th align={'center'}>Actions</th>
          </tr>
        </thead>
        <tbody className={'divide-y'}>
          {folders.data?.folders.map((folder: FolderModel) => (
            <FolderItem
              selected={selectedFolders}
              onSelect={handleFolderSelect}
              key={folder.id}
              folder={folder}
            />
          ))}
          {files.data?.map((file: FileModel) => (
            <FileItem
              selected={selectedFiles}
              onSelect={handleFileSelect}
              key={file.id}
              file={file}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
