import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useFiles, useFolders } from '@lib/query.ts';
import { SimpleDirectory } from '@models/folder.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useSearchState } from '@stores/searchStore.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useShallow } from 'zustand/react/shallow';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';
import { FileListBreadCrumbs } from '@pages/explorer/fileListBreadCrumbs.tsx';

export function FileList() {
  const [breadCrumbs, setBreadCrumbs] = useState<SimpleDirectory[]>([]);

  const { setCurrentFolder, setFilesInScope } = useExplorerStore(
    useShallow(s => ({
      setCurrentFolder: s.current.selectCurrentFolder,
      setFilesInScope: s.current.setFilesInScope,
    })),
  );
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);
  const { folder } = useParams();

  useEffect(() => {
    setSelectedNone();
    setCurrentFolder(folder);
    return () => {
      setCurrentFolder(undefined);
    };
  }, [folder, setCurrentFolder, setSelectedNone]);

  const sort = useSearchState(s => s.sort);

  const files = useFiles(folder, sort);

  useEffect(() => {
    setFilesInScope(files.data || []);
  }, [files, setFilesInScope]);

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
    <div
      ref={container}
      className={
        'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
      }>
      <motion.div
        className={
          'sticky top-0 z-20 min-h-0.5 w-full origin-[0%] bg-stone-500'
        }
        style={{ scaleX }}
      />
      <div className={'flex items-center pl-3 md:pl-0'}>
        <FileListBreadCrumbs crumbs={breadCrumbs} />
      </div>
      <FileUploadContent folder={folder} isInFileList={true}>
        <ExplorerDataDisplay
          isLoading={isLoading}
          files={files.data || []}
          folders={folders.data?.folders || []}
        />
      </FileUploadContent>
    </div>
  );
}
