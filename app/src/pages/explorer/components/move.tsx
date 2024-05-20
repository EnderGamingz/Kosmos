import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFiles } from '../../../lib/query.ts';

export function MoveAction({
  type,
  id,
  destination,
}: {
  type: 'file' | 'folder';
  id: string;
  destination: string | null;
}) {
  const moveAction = useMutation({
    mutationFn: () =>
      axios.put(`${BASE_URL}auth/${type}/move/${id}?folder_id=${destination}`),
    onSuccess: invalidateFiles,
  });

  return (
    <button onClick={() => moveAction.mutate()} disabled={moveAction.isPending}>
      Move to home
    </button>
  );
}
