import { PermanentDeleteAction } from './permanentDeleteAction.tsx';
import { useMutation } from '@tanstack/react-query';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Trash } from 'lucide-react';
import { api } from '@lib/queries/api.ts';

export function MoveToTrash({
  id,
  name,
  onClose,
  short,
}: {
  id: string;
  name: string;
  onClose?: () => void;
  short?: boolean;
}) {
  const permanent = useKeyStore(s => s.keys.shift);
  const trashAction = useMutation({
    mutationFn: () => api.post(`auth/file/${id}/bin`),
    onSuccess: () => {
      // Handled by presence
      //invalidateFiles().then();
      //invalidateUsage().then();
    },
  });

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  if (permanent)
    return (
      <PermanentDeleteAction
        short={short}
        deleteData={{ type: 'file', id, name }}
        onClose={onClose}
      />
    );

  return (
    <button
      disabled={trashAction.isPending}
      onClick={() => {
        onClose?.();
        trashAction.mutate();
      }}
      className={
        'text-red-500 hover:!text-red-800 dark:text-red-300 dark:hover:!text-red-300'
      }>
      <Trash />
      {short ? 'Trash' : 'Move to Trash'}
    </button>
  );
}

export function MultiMoveToTrash({
  deleteData,
  onClose,
}: {
  deleteData: { files: FileModelDTO[] };
  onClose: () => void;
}) {
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);

  const trashAction = useMutation({
    mutationFn: async () =>
      api
        .post(`auth/multi/bin`, {
          files: deleteData.files.map(file => file.id),
        })
        .then(async () => {
          // Handled by presence
          //invalidateFiles().then();
          //invalidateUsage().then();

          onClose();
          setSelectedNone();
        }),
  });

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  const handleDelete = () => {
    trashAction.mutate();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={trashAction.isPending}
      type={'button'}>
      <Trash />
      Move to trash
    </button>
  );
}
