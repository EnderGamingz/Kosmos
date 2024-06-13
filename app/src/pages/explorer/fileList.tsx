import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BreadCrumbs, { BreadCrumbItem } from '@components/BreadCrumbs.tsx';
import { useFiles, useFolders } from '@lib/query.ts';
import { SimpleDirectory } from '@models/folder.ts';
import { useFolderStore } from '@stores/folderStore.ts';
import { FileTable } from './fileTable.tsx';
import { HomeIcon } from '@heroicons/react/24/outline';
import { SideNavToggle } from '@pages/explorer/components/sideNavToggle.tsx';
import { FileUploadContent } from '@pages/explorer/file/fileUpload.tsx';

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
      className={
        'file-list relative flex h-full max-h-[calc(100vh-90px)] flex-col overflow-y-auto'
      }>
      <div className={'flex items-center pl-3 md:pl-0'}>
        <SideNavToggle />
        <BreadCrumbs>
          <BreadCrumbItem
            name={<HomeIcon />}
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
      </div>
      <FileUploadContent onClose={() => {}} folder={folder} isInFileList={true}>
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
      </FileUploadContent>
    </div>
  );
}
