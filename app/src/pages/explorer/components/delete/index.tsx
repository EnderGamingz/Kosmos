import { PermanentDeleteAction } from './permanentDeleteAction.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { invalidateFiles, invalidateUsage } from '@lib/query.ts';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';

export function MoveToTrash({
  id,
  name,
  onClose,
}: {
  id: string;
  name: string;
  onClose: () => void;
}) {
  const permanent = useKeyStore(s => s.shift);
  const trashAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/${id}/bin`),
    onSuccess: () => {
      invalidateFiles().then();
      invalidateUsage().then();
    },
  });

  if (permanent)
    return (
      <PermanentDeleteAction
        deleteData={{ type: 'file', id, name }}
        onClose={onClose}
      />
    );

  return (
    <button
      disabled={trashAction.isPending}
      onClick={() => {
        onClose();
        trashAction.mutate();
      }}
      className={'text-red-500 hover:!text-red-800'}>
      <TrashIcon />
      Move to Trash
    </button>
  );
}
