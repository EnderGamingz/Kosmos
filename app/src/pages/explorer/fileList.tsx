import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BreadCrumbs, { BreadCrumbItem } from '@components/BreadCrumbs.tsx';
import { MultiDownload } from './components/multiDownload.tsx';
import { useFiles, useFolders } from '@lib/query.ts';
import { SimpleDirectory } from '@models/folder.ts';
import { useFolderStore } from '@stores/folderStore.ts';
import { FileTable } from './fileTable.tsx';

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

  return (
    <div
      className={'file-list relative max-h-[calc(100vh-90px)] overflow-y-auto'}>
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
      <FileTable
        files={files.data || []}
        folders={folders.data?.folders || []}
        onFileSelect={handleFileSelect}
        onFolderSelect={handleFolderSelect}
        selectedFiles={selectedFiles}
        selectedFolders={selectedFolders}
        selectAll={() => {
          setSelectedFolders(
            folders.data?.folders.map(folder => folder.id) || [],
          );
          setSelectedFiles(files.data?.map(file => file.id) || []);
        }}
        selectNone={() => {
          setSelectedFolders([]);
          setSelectedFiles([]);
        }}
      />
    </div>
  );
}
