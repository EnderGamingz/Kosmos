import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect, useState } from 'react';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay';
import { useToAlbumMutation } from '@pages/explorer/pages/albums/single/useToAlbumMutation.ts';
import { useFilesInfinite, useFolders } from '@lib/query.ts';
import { ExplorerDisplay } from '@stores/preferenceStore.ts';
import { useFolderBreadCrumbs } from '@hooks/useFolderBreadCrumbs.ts';
import { FileListBreadCrumbs } from '@pages/explorer/fileListBreadCrumbs.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import useDisclosure from '@hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Button } from '@components/ui/button.tsx';
import { Check, Plus } from 'lucide-react';

function AlbumAddItemsContent({
  addTo,
  initialFiles,
  onClose,
}: {
  addTo: string;
  initialFiles: FileModelDTO[];
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
    update
      .mutateAsync({
        add: added.map(file => file.id),
        remove: removed.map(file => file.id),
      })
      .then(() => {
        onClose();
      });
  };

  const files = useFilesInfinite(virtualFolder, { album_files: true }, 50);
  const folders = useFolders(virtualFolder);

  const breadCrumbs = useFolderBreadCrumbs(folders.data);

  return (
    <div className={'flex h-full select-none flex-col'}>
      <div className={'flex items-center pl-3 md:pl-0'}>
        <FileListBreadCrumbs
          crumbs={breadCrumbs}
          clickOverwrite={setVirtualFolder}
        />
      </div>
      <div
        className={
          'file-list relative flex h-full flex-col overflow-y-auto max-md:max-h-[calc(100dvh-148px)]'
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
      <DialogFooter>
        <Button onClick={submit} className={'mt-5 px-10'}>
          <Check />
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

export function AlbumAddItems({
  id,
  added,
  small,
}: {
  id: string;
  added: FileModelDTO[];
  small?: boolean;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button size={small ? 'sm' : 'default'} onClick={onOpen}>
        <Plus />
        Add Items
      </Button>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={'!max-w-full !max-h-full h-full rounded-none'}>
          <DialogHeader className={'sr-only'}>
            <DialogTitle>Add images to album</DialogTitle>
            <DialogDescription>
              Add images to the album by selecting them from the file list.
            </DialogDescription>
          </DialogHeader>
          <AlbumAddItemsContent
            addTo={id}
            initialFiles={added}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
