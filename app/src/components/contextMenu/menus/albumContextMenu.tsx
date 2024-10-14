import { AlbumFile } from '@models/album.ts';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import SetAlbumPreview from '@pages/explorer/pages/albums/setAlbumPrevíew.tsx';
import AlbumAction from '@pages/explorer/pages/albums/AlbumAction.tsx';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { RenameAction } from '@pages/explorer/components/rename';

export function AlbumContextMenu({
  data,
  onClose,
}: {
  data: AlbumFile;
  onClose: () => void;
}) {
  return (
    <>
      <ContextMenuTitle type={'file'} title={data.file_name} />
      <SetAlbumPreview album={data.album} fileId={data.id} onClose={onClose} />
      <AlbumAction files={[data]} albumId={data.album.id} onClose={onClose} />
      <DownloadSingleAction
        id={data.id}
        name={data.file_name}
        onClose={onClose}
      />
      <ShareButton id={data.id} type={'file'} onClose={onClose} />
      <RenameAction
        type={'file'}
        id={data.id}
        name={data.file_name}
        onClose={onClose}
      />
    </>
  );
}
