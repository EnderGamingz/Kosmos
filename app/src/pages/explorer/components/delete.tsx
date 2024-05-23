import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFiles, invalidateFolders } from '../../../lib/query.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';
import { OperationType } from '../../../../models/file.ts';

export function DeleteAction({
  type,
  id,
}: {
  type: OperationType;
  id: string;
}) {
  const notification = useNotifications(s => s.actions);
  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `Deleting ${type}`,
        loading: true,
        severity: Severity.INFO,
      });

      await axios
        .delete(`${BASE_URL}auth/${type}/${id}`)
        .then(async () => {
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted successfully',
            timeout: 1000,
          });

          if (type === 'file') await invalidateFiles();
          else await invalidateFolders();
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            // @ts-ignore
            description: err.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
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
