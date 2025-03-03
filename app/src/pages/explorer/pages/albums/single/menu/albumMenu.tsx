import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { AlbumDelete } from '@pages/explorer/pages/albums/single/menu/albumDelete.tsx';
import { ReactNode } from 'react';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import useDisclosure from '@/hooks/useDisclosure';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AlbumMenu({
  album,
  children,
}: {
  album: AlbumModelDTO;
  children?: ReactNode;
}) {
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <button className={'text-stone-800 dark:text-stone-100'}>
          <EllipsisVerticalIcon className={'h-8 w-8'} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'} className={'min-w-32 max-w-52 space-y-2'}>
        <ContextMenuTitle title={album.name} type={'album'} />
        <ShareButton
          className={'menu-button w-full'}
          id={album.id}
          type={'album'}
          onClose={onClose}
        />
        <AlbumDelete id={album.id} onClose={onClose} />
        {children}
      </PopoverContent>
    </Popover>
  );
}
