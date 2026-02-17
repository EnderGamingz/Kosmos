import { useToAlbumMutation } from '@pages/explorer/pages/albums/single/useToAlbumMutation.ts';
import { isValidFileForAlbum } from '@models/album.ts';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { DisplayContext } from '@lib/contexts.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import useDisclosure from '@hooks/useDisclosure.ts';
import { Button } from '@components/ui/button.tsx';
import {
  Check,
  ImageMinus,
  ImagePlus,
  SquareArrowOutUpRight,
} from 'lucide-react';

function AddToAlbumModalContent({ files }: { files: FileModelDTO[] }) {
  const [loading, setLoading] = useState<string[]>([]);
  const albums = AlbumQuery.useAvailableAlbums(files.map(file => file.id));

  const update = useToAlbumMutation();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Albums</DialogTitle>
        <DialogDescription>Click on an album to add the file</DialogDescription>
      </DialogHeader>
      <div className={'min-h-32'}>
        <ul
          className={cn(
            '[&_li:not(.added):hover]:bg-indigo-100 [&_li]:rounded-md [&_li]:px-2 [&_li]:py-1 [&_li]:transition-colors',
            'dark:[&_li:not(.added):hover]:bg-indigo-700/50',
          )}
        >
          {albums.data?.available.map(album => (
            <motion.li
              layout
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, bounce: 0.1 }}
              key={album.id}
              onClick={() => {
                if (loading.includes(album.id)) return;
                setLoading([...loading, album.id]);
                update
                  .mutateAsync({
                    add: files.map(file => file.id),
                    remove: [],
                    overwriteId: album.id,
                  })
                  .then(() => {
                    setLoading(loading.filter(id => id !== album.id));
                  });
              }}
            >
              {album.name}
              {loading.includes(album.id) && (
                <span className={'ml-1 text-sm'}>Adding</span>
              )}
            </motion.li>
          ))}
          {!albums.data?.available.length && (
            <motion.span layout className={'text-muted-foreground'}>
              No albums available
            </motion.span>
          )}
          {!!albums.data?.added.length && (
            <>
              <motion.hr layout className={'my-2'} />
              <motion.span layout className={'text-xs text-muted-foreground'}>
                Added
              </motion.span>
            </>
          )}

          {albums.data?.added.map(album => (
            <motion.li
              layout
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, bounce: 0.1 }}
              key={album.id}
              className={'added flex items-center gap-2 text-muted-foreground'}
            >
              <Check className={'h-4 w-4'} />
              {album.name}
              <Link className={'ml-auto'} to={`/home/album/${album.id}`}>
                <SquareArrowOutUpRight
                  className={'h-4 w-4 text-muted-foreground'}
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

export default function AlbumAction({
  files,
  albumId,
  onClose,
  dense,
  shareUuid,
}: {
  files: FileModelDTO[];
  albumId?: string;
  onClose?: () => void;
  dense?: boolean;
  shareUuid?: string;
}) {
  const update = useToAlbumMutation(albumId);
  const context = useContext(DisplayContext);

  const { isOpen, onOpenChange, onOpen: disclosureOnOpen } = useDisclosure();

  if (context.shareUuid || shareUuid || !files.length) return null;
  const fileValidState = files.map(isValidFileForAlbum);
  if (!fileValidState.every(x => x)) return null;

  const handleClick = () => {
    if (albumId && files.length === 1) {
      update
        .mutateAsync({ remove: files.map(file => file.id), add: [] })
        .then(() => {
          onClose?.();
        });
    } else {
      disclosureOnOpen();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          onOpenChange();
          onClose?.();
        }}
      >
        <DialogContent>
          <AddToAlbumModalContent files={files} />
        </DialogContent>
      </Dialog>
      <button onClick={handleClick} className={'[&>svg]:w-6 [&>svg]:h-6'}>
        {albumId ? <ImageMinus /> : <ImagePlus />}
        {dense ? 'Album' : albumId ? 'Remove from album' : 'Add to album'}
      </button>
    </>
  );
}
