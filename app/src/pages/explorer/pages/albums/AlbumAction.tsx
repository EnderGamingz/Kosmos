import { FileModel } from '@models/file.ts';
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  MinusCircleIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline';
import { useToAlbumMutation } from '@pages/explorer/pages/albums/single/useToAlbumMutation.ts';
import { isValidFileForAlbum } from '@models/album.ts';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function AddToAlbumModalContent({
  onClose,
  file,
}: {
  onClose: () => void;
  file: FileModel;
}) {
  const [loading, setLoading] = useState<string[]>([]);
  const albums = AlbumQuery.useAvailableAlbums(file.id);

  const update = useToAlbumMutation();

  return (
    <>
      <ModalHeader className='grid gap-1'>
        <h2 className={'text-xl'}>
          Albums
          <p className={'text-sm text-stone-500'}>
            Click on an album to add the file
          </p>
        </h2>
      </ModalHeader>
      <ModalBody className={'min-h-32'}>
        <ul
          className={
            '[&_li:not(.added):hover]:bg-indigo-100 [&_li:not(.added)]:cursor-pointer [&_li]:rounded-md [&_li]:px-2 [&_li]:py-1 [&_li]:transition-colors'
          }>
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
                    add: [file.id],
                    remove: [],
                    overwriteId: album.id,
                  })
                  .then(() => {
                    albums.refetch().then();
                  });
              }}>
              {album.name}
              {loading.includes(album.id) && (
                <span className={'text-sm text-stone-400'}>Adding</span>
              )}
            </motion.li>
          ))}
          {!albums.data?.available.length && (
            <motion.span layout className={'text-stone-500'}>
              No albums available
            </motion.span>
          )}
          {!!albums.data?.added.length && (
            <>
              <motion.hr layout className={'my-2'} />
              <motion.span layout className={'text-xs text-stone-400'}>
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
              className={'added flex items-center gap-2 text-stone-500'}>
              <CheckIcon className={'h-4 w-4'} />
              {album.name}
              <Link className={'ml-auto'} to={`/home/album/${album.id}`}>
                <ArrowTopRightOnSquareIcon
                  className={'h-4 w-4 text-stone-800'}
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </ModalBody>
      <ModalFooter className={'justify-between'}>
        <button
          onClick={onClose}
          className={
            'rounded-md px-3 py-1 text-slate-600 outline outline-1 outline-slate-600'
          }>
          Cancel
        </button>
      </ModalFooter>
    </>
  );
}

export default function AlbumAction({
  file,
  albumId,
  onClose,
}: {
  file: FileModel;
  albumId?: string;
  onClose: () => void;
}) {
  const update = useToAlbumMutation(albumId);

  const {
    isOpen,
    onOpenChange,
    onOpen: disclosureOnOpen,
    onClose: disclosureOnClose,
  } = useDisclosure();

  const handleClick = () => {
    if (albumId) {
      update.mutateAsync({ remove: [file.id], add: [] }).then(() => {
        onClose();
      });
    } else {
      disclosureOnOpen();
    }
  };

  if (!isValidFileForAlbum(file)) return null;

  return (
    <>
      <Modal
        size={'md'}
        backdrop={'blur'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement={'auto'}>
        <ModalContent>
          <AddToAlbumModalContent
            file={file}
            onClose={() => {
              disclosureOnClose();
              setTimeout(() => {
                onClose?.();
              }, 400);
            }}
          />
        </ModalContent>
      </Modal>
      <button onClick={handleClick}>
        {albumId ? <MinusCircleIcon /> : <SquaresPlusIcon />}
        {albumId ? 'Remove from album' : 'Add to album'}
      </button>
      <hr />
    </>
  );
}
