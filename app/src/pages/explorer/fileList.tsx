import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useFilesInfinite, useFolders } from '@lib/query.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useSearchState } from '@stores/searchStore.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import { useShallow } from 'zustand/react/shallow';
import { FileListBreadCrumbs } from '@pages/explorer/fileListBreadCrumbs.tsx';
import StorageLimitBanner from '@pages/explorer/components/storageLimitBanner.tsx';
import { useFolderBreadCrumbs } from '@hooks/useFolderBreadCrumbs.ts';
import { cn } from '@lib/utils.ts';

export default function FileList() {
  const { setCurrentFolder, setFilesInScope, setSelectedNone } =
    useExplorerStore(
      useShallow(s => ({
        setCurrentFolder: s.current.selectCurrentFolder,
        setFilesInScope: s.current.setFilesInScope,
        setSelectedNone: s.selectedResources.selectNone,
      })),
    );

  const { folder } = useParams();

  useEffect(() => {
    setSelectedNone();
    setCurrentFolder(folder);
    return () => setCurrentFolder(undefined);
  }, [folder, setCurrentFolder, setSelectedNone]);

  const sort = useSearchState(s => s.sort);

  const files = useFilesInfinite(folder, sort, 50);

  useEffect(() => {
    setFilesInScope(files.data?.pages.flat() || []);
  }, [files, setFilesInScope]);

  const folders = useFolders(folder, sort);

  const breadCrumbs = useFolderBreadCrumbs(folders.data);

  const isLoading = files.isLoading || folders.isLoading;

  return (
    <div
      className={cn(
        'file-list relative flex flex-col overflow-hidden',
        'h-full max-h-[calc(100dvh-90px)] max-md:max-h-[calc(100dvh-90px-80px)]',
      )}>
      <div className={'flex items-center border-b'}>
        <FileListBreadCrumbs crumbs={breadCrumbs} />
      </div>
      <StorageLimitBanner />
      <ExplorerDataDisplay
        isLoading={isLoading}
        files={files.data?.pages.flat() || []}
        folders={folders.data?.folders || []}
        viewSettings={{
          paged: true,
          isCreateAllowed: true,
          hasNextPage: files.hasNextPage,
          onLoadNextPage: async () => {
            if (files.isFetching) return;
            await files.fetchNextPage();
          },
        }}
      />
    </div>
  );
}
