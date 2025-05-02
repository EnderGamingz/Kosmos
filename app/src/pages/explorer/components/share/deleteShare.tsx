import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { invalidateShares } from '@lib/query.ts';
import { Trash } from 'lucide-react';
import { api } from '@lib/queries/api.ts';

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
      await api
        .delete(`auth/share/${id}`)
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
      <Trash className={'w-4 text-red-400'} />
    </button>
  );
}
