import { PermanentDeleteAction } from './permanentDeleteAction.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { invalidateFiles, invalidateUsage } from '@lib/query.ts';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

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
      className={'text-red-500 hover:!text-red-800'}>
      <ArchiveBoxXMarkIcon />
      {short ? 'Trash' : 'Move to Trash'}
    </button>
  );
}
