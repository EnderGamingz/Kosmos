import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFiles, invalidateFolders } from '../../../lib/query.ts';

export function DeleteAction({
  type,
  id,
}: {
  type: 'file' | 'folder';
  id: string;
}) {
  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/${type}/${id}`),
    onSuccess: type === 'file' ? invalidateFiles : invalidateFolders,
  });

  return (
    <button
      onClick={() => deleteAction.mutate()}
      disabled={deleteAction.isPending}>
      Delete
    </button>
  );
}
