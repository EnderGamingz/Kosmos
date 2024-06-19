import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import BreadCrumbs, { BreadCrumbItem } from '@components/BreadCrumbs.tsx';
import { useFiles, useFolders } from '@lib/query.ts';
import { SimpleDirectory } from '@models/folder.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import { FileTable } from './fileTable/fileTable.tsx';
import { HomeIcon } from '@heroicons/react/24/outline';
import { SideNavToggle } from '@pages/explorer/components/sideNavToggle.tsx';
import { FileUploadContent } from '@pages/explorer/file/fileUpload.tsx';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FileTableLoading } from '@pages/explorer/fileTable/fileTableLoading.tsx';
import { useSearchState } from '@stores/searchStore.ts';

export function FileList() {
  const [breadCrumbs, setBreadCrumbs] = useState<SimpleDirectory[]>([]);

  const setCurrentFolder = useExplorerStore(s => s.current.selectCurrentFolder);
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);
  const { folder } = useParams();

  useEffect(() => {
    setSelectedNone();
    setCurrentFolder(folder);
  }, [folder, setCurrentFolder, setSelectedNone]);

  const sort = useSearchState(s => s.sort);

  const files = useFiles(folder, sort);
  const folders = useFolders(folder, sort);

  useEffect(() => {
    if (!folders.data) return;
    if (!folders.data.structure) {
      setBreadCrumbs([]);
    } else if (folders.data.structure.length > 0) {
      setBreadCrumbs(folders.data.structure);
    }
  }, [folders.data]);

  const isLoading = files.isLoading || folders.isLoading;

  const container = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ container });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <div
        ref={container}
        className={
          'file-list relative flex h-full max-h-[calc(100vh-90px)] flex-col overflow-y-auto'
        }>
        <motion.div
          className={
            'sticky top-0 z-20 min-h-0.5 w-full origin-[0%] bg-stone-500'
          }
          style={{ scaleX }}
        />
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
        <FileUploadContent folder={folder} isInFileList={true}>
          {isLoading ? (
            <FileTableLoading />
          ) : (
            <FileTable
              files={files.data || []}
              folders={folders.data?.folders || []}
            />
          )}
        </FileUploadContent>
      </div>
    </>
  );
}
