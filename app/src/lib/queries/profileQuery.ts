import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ProfileModelDTO } from '@bindings/ProfileModelDTO.ts';
import { NotificationActions, Severity } from '@/stores/notificationStore';
import { api } from '@lib/queries/api.ts';

export class ProfileQuery {
  public static useProfileByIdSuspense = (id?: string) => {
    return useSuspenseQuery({
      queryFn: () =>
        api.get(`auth/profile/${id}`).then(res => res.data as ProfileModelDTO),
      queryKey: ['profile', id],
    });
  };

  public static useRemoveAvatarMutation(
    notifications: NotificationActions,
    onSuccess?: () => void,
  ) {
    return useMutation({
      mutationFn: async () => {
        const updateId = notifications.notify({
          title: 'Remove Avatar',
          severity: Severity.INFO,
          loading: true,
          canDismiss: false,
        });
        await api
          .patch(`auth/user/avatar`, {
            file_id: null,
          })
          .then(() => {
            notifications.updateNotification(updateId, {
              severity: Severity.SUCCESS,
              status: 'Removed',
              timeout: 1000,
              canDismiss: true,
            });
            onSuccess?.();
          })
          .catch(e => {
            notifications.updateNotification(updateId, {
              severity: Severity.ERROR,
              status: 'Error',
              description: e.response?.data?.error || 'Error',
              timeout: 2000,
              canDismiss: true,
            });
          });
      },
    });
  }
}
