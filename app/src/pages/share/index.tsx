import { useParams } from 'react-router-dom';
import type { DataOperationType } from '@models/file.ts';
import { FileShareDisplay } from '@pages/share/shareTypes/fileShareDisplay.tsx';
import { FolderShareDisplay } from '@pages/share/shareTypes/folderShareDisplay.tsx';
import { ShareMessage } from '@pages/share/shareMessage.tsx';
import Preferences from '@pages/settings/preferences';
import { AlbumShareDisplay } from '@pages/share/shareTypes/albumShareDisplay.tsx';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { AppWindow } from 'lucide-react';

function SharePreferences() {
  return (
    <div className={'fixed bottom-3 right-3 z-20'}>
      <Popover>
        <PopoverTrigger asChild>
          <Button>
            <AppWindow className={'h-6 w-6'} />
            <span>Preferences</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={'max-w-md w-full'}>
          <Preferences inPopup />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function SharePage() {
  const { type, uuid } = useParams();
  if (!type || !uuid) {
    return <ShareMessage text={'Invalid share link'} />;
  }

  return (
    <>
      <SharePageData type={type as DataOperationType} uuid={uuid} />
      {type === 'folder' && <SharePreferences />}
    </>
  );
}

function SharePageData({
  type,
  uuid,
}: {
  type: DataOperationType;
  uuid: string;
}) {
  if (type === 'folder') return <FolderShareDisplay uuid={uuid} />;
  if (type === 'file') return <FileShareDisplay uuid={uuid} />;
  if (type === 'album') return <AlbumShareDisplay uuid={uuid} />;
  return null;
}
