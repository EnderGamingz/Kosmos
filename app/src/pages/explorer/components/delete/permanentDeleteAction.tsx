import { invalidateData, invalidateUsage } from '@lib/query.ts';
import { OperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { TrashIcon } from '@heroicons/react/24/outline';

export function PermanentDeleteAction({
  deleteData,
  onClose,
}: {
  deleteData: { id: string; type: OperationType; name: string };
  onClose: () => void;
}) {
  const notification = useNotifications(s => s.actions);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `Deleting ${deleteData.type}`,
        loading: true,
        severity: Severity.INFO,
      });

      await axios
        .delete(`${BASE_URL}auth/${deleteData.type}/${deleteData.id}`)
        .then(async () => {
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted successfully',
            timeout: 1000,
          });

          invalidateData(deleteData.type).then();
          invalidateUsage().then();
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            description: err.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  return (
    <button
      onClick={() => {
        onClose();
        deleteAction.mutate();
      }}
      type={'button'}
      className={'text-red-500 hover:!text-red-800'}>
      <TrashIcon />
      Delete Permanently
    </button>
  );
}
