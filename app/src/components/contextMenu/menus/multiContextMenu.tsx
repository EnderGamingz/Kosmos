import { Selected } from '@models/file.ts';
import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { MultiDownload } from '@pages/explorer/components/multiDownload.tsx';
import { MoveAction } from '@pages/explorer/components/move';
import { MultiMoveToTrash } from '@pages/explorer/components/delete';
import { MultiPermanentDelete } from '@pages/explorer/components/delete/permanentDeleteAction.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import AlbumAction from '@pages/explorer/pages/albums/AlbumAction.tsx';

export function MultiContextMenu({
  data,
  onClose,
}: {
  data: Selected;
  onClose: () => void;
}) {
  const currentFolder = useExplorerStore(s => s.current.folder);

  const title = `${data.files.length} file${data.files.length === 1 ? '' : 's'}, 
    ${data.folders.length} folder${data.folders.length === 1 ? '' : 's'}`;
  return (
    <>
      <ContextMenuTitle type={'multi'} title={title} />
      {data.files.length && !data.folders.length && (
        <AlbumAction files={data.files} onClose={onClose} />
      )}
      <MultiDownload
        files={data.files}
        folders={data.folders}
        isContextAction
        onClose={onClose}
      />
      <MoveAction
        type={'multi'}
        multiData={{ files: data.files, folders: data.folders }}
        onClose={onClose}
        current_parent={currentFolder}
      />

      {!!data.files.length && !data.folders.length && (
        <MultiMoveToTrash
          deleteData={{ files: data.files }}
          onClose={onClose}
        />
      )}
      <hr />
      <MultiPermanentDelete
        deleteData={{ folders: data.folders, files: data.files }}
        onClose={onClose}
      />
    </>
  );
}
