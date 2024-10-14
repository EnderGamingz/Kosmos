import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import AlbumAction from '@pages/explorer/pages/albums/AlbumAction.tsx';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import { MoveToTrash } from '@pages/explorer/components/delete';

export function FileContextMenu({
  data,
  onClose,
}: {
  data: FileModelDTO;
  onClose: () => void;
}) {
  return (
    <>
      <ContextMenuTitle type={'file'} title={data.file_name} />
      <AlbumAction files={[data]} onClose={onClose} />
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
      <MoveAction
        type={'file'}
        name={data.file_name}
        id={data.id}
        current_parent={data.parent_folder_id}
        onClose={onClose}
      />
      <MoveToTrash id={data.id} name={data.file_name} onClose={onClose} />
    </>
  );
}
