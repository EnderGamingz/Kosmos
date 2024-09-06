import { PermanentDeleteAction } from './permanentDeleteAction.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFiles, invalidateUsage } from '@lib/query.ts';
import { ArchiveBoxXMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';

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
    mutationFn: () => axios.post(`${BASE_URL}auth/file/${id}/bin`),
    onSuccess: () => {
      invalidateFiles().then();
      invalidateUsage().then();
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
      <ArchiveBoxXMarkIcon />
      {short ? 'Trash' : 'Move to Trash'}
    </button>
  );
}

export function MultiMoveToTrash({
  deleteData,
  onClose,
}: {
  deleteData: { files: string[] };
  onClose: () => void;
}) {
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);

  const trashAction = useMutation({
    mutationFn: async () =>
      axios
        .post(`${BASE_URL}auth/multi/bin`, {
          files: deleteData.files,
        })
        .then(async () => {
          invalidateFiles().then();
          invalidateUsage().then();

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
      <TrashIcon />
      Move to trash
    </button>
  );
}
