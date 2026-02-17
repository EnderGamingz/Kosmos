import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { AlbumDelete } from '@pages/explorer/pages/albums/single/menu/albumDelete.tsx';
import type { ReactNode } from 'react';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import type { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import useDisclosure from '@/hooks/useDisclosure';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EllipsisVertical } from 'lucide-react';

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
      <PopoverTrigger asChild>
        <button className={'text-stone-800 dark:text-stone-100'}>
          <EllipsisVertical className={'h-6 w-6'} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'} className={'min-w-32 max-w-52 space-y-2'}>
        <ContextMenuTitle title={album.name} type={'album'} />
        <ShareButton
          className={'menu-button w-full animate-fade-in-top delay-50'}
          id={album.id}
          type={'album'}
          onClose={onClose}
        />
        <div className={'animate-fade-in-top delay-100'}>
          <AlbumDelete id={album.id} onClose={onClose} />
        </div>
        <div className={'animate-fade-in-top delay-150'}>{children}</div>
      </PopoverContent>
    </Popover>
  );
}
