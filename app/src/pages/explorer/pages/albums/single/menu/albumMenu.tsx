import { AlbumModel } from '@models/album.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { AlbumDelete } from '@pages/explorer/pages/albums/single/menu/albumDelete.tsx';
import { ReactNode } from 'react';

export function AlbumMenu({
  album,
  children,
}: {
  album: AlbumModel;
  children?: ReactNode;
}) {
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  return (
    <Popover placement={'bottom'} isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <button>
          <EllipsisVerticalIcon className={'h-8 w-8'} />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={'min-w-32 space-y-2 px-1 py-1.5'}>
          <ContextMenuTitle title={album.name} type={'album'} />
          <AlbumDelete id={album.id} onClose={onClose} />
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
