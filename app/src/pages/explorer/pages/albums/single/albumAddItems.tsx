import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import tw from '@utils/classMerge.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay';
import { useToAlbumMutation } from '@pages/explorer/pages/albums/single/useToAlbumMutation.ts';
import { useFilesInfinite, useFolders } from '@lib/query.ts';
import { ExplorerDisplay } from '@stores/preferenceStore.ts';
import { useFolderBreadCrumbs } from '@hooks/useFolderBreadCrumbs.ts';
import { FileListBreadCrumbs } from '@pages/explorer/fileListBreadCrumbs.tsx';

function AlbumAddItemsContent({
  addTo,
  initialFiles,
  onClose,
}: {
  addTo: string;
  initialFiles: string[];
  onClose: () => void;
}) {
  const [virtualFolder, setVirtualFolder] = useState<string | undefined>(
    undefined,
  );
  const { selectedFiles, selectFile, selectNone } = useExplorerStore(
    s => s.selectedResources,
  );

  const update = useToAlbumMutation(addTo);

  useEffect(() => {
    selectNone();
    initialFiles.map(file => selectFile(file));

    return () => {
      selectNone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    // Get added and removed
    const added = selectedFiles.filter(file => !initialFiles.includes(file));
    const removed = initialFiles.filter(file => !selectedFiles.includes(file));

    selectNone();
    update.mutateAsync({ add: added, remove: removed }).then(() => {
      onClose();
    });
  };

  const files = useFilesInfinite(virtualFolder, { album_files: true }, 50);
  const folders = useFolders(virtualFolder);

  const breadCrumbs = useFolderBreadCrumbs(folders.data);

  return (
    <div className={'flex h-full select-none flex-col p-10'}>
      <div className={'flex items-center pl-3 shadow-sm md:pl-0'}>
        <FileListBreadCrumbs
          crumbs={breadCrumbs}
          clickOverwrite={setVirtualFolder}
        />
      </div>
      <div
        className={
          'file-list relative flex h-full flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <ExplorerDataDisplay
          overwriteDisplay={{
            displayMode: ExplorerDisplay.Table,
          }}
          isLoading={files.isLoading}
          files={files.data?.pages.flat() || []}
          folders={folders.data?.folders || []}
          viewSettings={{
            limitedView: true,
            paged: true,
            noDisplay: true,
            scrollControlMissing: true,
            hasNextPage: files.hasNextPage,
            selectDisable: {
              folders: true,
            },
            handleOverwrites: {
              onFolderClick: setVirtualFolder,
            },
            onLoadNextPage: async () => {
              if (files.isFetching) return;
              await files.fetchNextPage();
            },
          }}
        />
      </div>
      <button onClick={submit} className={'btn-black mt-5'}>
        <CheckIcon />
        Save
      </button>
    </div>
  );
}

export function AlbumAddItems({
  id,
  added,
  small,
}: {
  id: string;
  added: string[];
  small?: boolean;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <button
        className={tw('btn-black transition-all', Boolean(small) && 'btn-sm')}
        onClick={onOpen}>
        <PlusIcon />
        Add Items
      </button>
      <Modal size={'full'} isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent className={'bg-stone-50 dark:bg-stone-800'}>
          <AlbumAddItemsContent
            addTo={id}
            initialFiles={added}
            onClose={onClose}
          />
        </ModalContent>
      </Modal>
    </>
  );
}
