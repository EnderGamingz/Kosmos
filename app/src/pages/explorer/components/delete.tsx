import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFiles, invalidateFolders } from '../../../lib/query.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';

export function DeleteAction({
  type,
  id,
}: {
  type: 'file' | 'folder';
  id: string;
}) {
  const notify = useNotifications(s => s.actions.notify);
  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/${type}/${id}`),
    onSuccess: async () => {
      notify({
        id: new Date().toISOString(),
        title: `${type === 'file' ? 'File' : 'Folder'} deleted`,
        severity: Severity.SUCCESS,
        timeout: 1000,
      });
      if (type === 'file') await invalidateFiles();
      else await invalidateFolders();
    },
  });

  return (
    <button
      onClick={() => deleteAction.mutate()}
      disabled={deleteAction.isPending}>
      Delete
    </button>
  );
}
