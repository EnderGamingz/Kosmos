import { useParams } from 'react-router-dom';
import { DataOperationType } from '@models/file.ts';
import { FileShareDisplay } from '@pages/share/shareTypes/fileShareDisplay.tsx';
import { FolderShareDisplay } from '@pages/share/shareTypes/folderShareDisplay.tsx';
import { ShareMessage } from '@pages/share/shareMessage.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import Preferences from '@pages/settings/preferences';
import { WindowIcon } from '@heroicons/react/24/outline';
import { AlbumShareDisplay } from '@pages/share/shareTypes/albumShareDisplay.tsx';

function SharePreferences() {
  return (
    <div className={'fixed bottom-3 right-3 z-20'}>
      <Popover>
        <PopoverTrigger>
          <button className={'btn-black'}>
            <WindowIcon className={'h-6 w-6'} />
            <span>Preferences</span>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className={'p-2'}>
            <Preferences inPopup />
          </div>
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
