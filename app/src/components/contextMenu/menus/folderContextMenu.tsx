import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import {
  ColorDisplay,
  FolderColorChange,
} from '@components/contextMenu/ColorChange.tsx';
import { MultiDownload } from '@pages/explorer/components/multiDownload.tsx';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import {
  MultiPermanentDelete,
  PermanentDeleteAction,
} from '@pages/explorer/components/delete/permanentDeleteAction.tsx';

export function FolderContextMenu({
  data,
  onClose,
}: {
  data: FolderModelDTO;
  onClose: () => void;
}) {
  return (
    <>
      <ContextMenuTitle type={'folder'} title={data.folder_name}>
        <ColorDisplay color={data.color || 'lightgray'} />
      </ContextMenuTitle>
      <MultiDownload
        files={[]}
        folders={[data]}
        isContextAction
        onClose={onClose}
      />
      <ShareButton id={data.id} type={'folder'} onClose={onClose} />
      <RenameAction
        type={'folder'}
        id={data.id}
        name={data.folder_name}
        onClose={onClose}
      />
      <FolderColorChange
        folderId={data.id}
        parent={data.parent_id}
        color={data.color}
      />
      <MoveAction
        type={'folder'}
        name={data.folder_name}
        id={data.id}
        current_parent={data.parent_id}
        onClose={onClose}
      />
      <PermanentDeleteAction
        deleteData={{ type: 'folder', id: data.id, name: data.folder_name }}
        onClose={onClose}
      />
      <MultiPermanentDelete
        deleteData={{ folders: [data], files: [] }}
        onClose={onClose}
      />
    </>
  );
}
