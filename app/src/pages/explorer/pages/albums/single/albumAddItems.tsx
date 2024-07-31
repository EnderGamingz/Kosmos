import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import tw from '@utils/classMerge.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay';
import { useToAlbumMutation } from '@pages/explorer/pages/albums/single/useToAlbumMutation.ts';

function AlbumAddItemsContent({
  addTo,
  initialFiles,
  onClose,
}: {
  addTo: string;
  initialFiles: string[];
  onClose: () => void;
}) {
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

  const files = AlbumQuery.useInfiniteAvailableFiles();
  return (
    <div className={'flex h-full select-none flex-col p-10'}>
      <div
        className={
          'file-list relative flex h-full flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <ExplorerDataDisplay
          isLoading={files.isLoading}
          files={files.data?.pages.flat() || []}
          folders={[]}
          viewSettings={{
            limitedView: true,
            paged: true,
            noDisplay: true,
            scrollControlMissing: true,
            hasNextPage: files.hasNextPage,
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
        <ModalContent>
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
