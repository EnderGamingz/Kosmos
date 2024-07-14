import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { invalidateShares } from '@lib/query.ts';
import { TrashIcon } from '@heroicons/react/24/outline';

export function DeleteShare({ id }: { id: string }) {
  const notifications = useNotifications(s => s.actions);
  const action = useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Delete share',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .delete(`${BASE_URL}auth/share/${id}`)
        .then(() => {
          invalidateShares().then();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(e => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            canDismiss: true,
          });
        });
    },
  });
  return (
    <button
      className={'flex'}
      onClick={() => action.mutate()}
      disabled={action.isPending}>
      <TrashIcon className={'w-4 text-red-400'} />
    </button>
  );
}
