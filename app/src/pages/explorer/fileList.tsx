import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BreadCrumbs, { BreadCrumbItem } from '../../components/BreadCrumbs.tsx';
import { MultiDownload } from './components/multiDownload.tsx';
import { useFiles, useFolders } from '../../lib/query.ts';
import { FolderModel, SimpleDirectory } from '../../../models/folder.ts';
import { FolderItem } from './folder/folderItem.tsx';
import { FileModel } from '../../../models/file.ts';
import { FileItem } from './file/fileItem.tsx';
import { Checkbox } from '@nextui-org/react';
import { useFolderStore } from '../../stores/folderStore.ts';

export function FileList() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [breadCrumbs, setBreadCrumbs] = useState<SimpleDirectory[]>([]);

  const selectFolder = useFolderStore(s => s.actions.selectFolder);
  const { folder } = useParams();

  useEffect(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
    selectFolder(folder);
  }, [folder, selectFolder]);

  const files = useFiles(folder);
  const folders = useFolders(folder);

  useEffect(() => {
    if (!folders.data) return;
    if (!folders.data.structure) {
      setBreadCrumbs([]);
    } else if (folders.data.structure.length > 0) {
      setBreadCrumbs(folders.data.structure);
    }
  }, [folders.data]);

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
  const hasData = !!folders.data?.folders.length && !!files?.data?.length;

  return (
    <div className={' max-h-[calc(100vh-90px)] overflow-y-auto'}>
      <BreadCrumbs>
        <BreadCrumbItem
          name={'Home'}
          href={'/home'}
          last={!breadCrumbs.length}
        />
        {breadCrumbs.map((item, i) => (
          <BreadCrumbItem
            last={i === breadCrumbs.length - 1}
            key={`crumb-${item.id}`}
            name={item.folder_name}
            href={`/home/folder/${item.id}`}
          />
        ))}
      </BreadCrumbs>
      <MultiDownload files={selectedFiles} folders={selectedFolders} />
      <table className={'w-full table-auto text-left'}>
        <thead>
          <tr className={'[&_th]:p-3'}>
            <th>
              <Checkbox
                isSelected={isAllSelected && hasData}
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
    </div>
  );
}
