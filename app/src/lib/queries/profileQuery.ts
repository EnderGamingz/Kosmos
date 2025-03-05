import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { ProfileModelDTO } from '@bindings/ProfileModelDTO.ts';
import { NotificationActions, Severity } from '@/stores/notificationStore';

export class ProfileQuery {
  public static useProfileByIdSuspense = (id?: string) => {
    return useSuspenseQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/profile/${id}`)
          .then(res => res.data as ProfileModelDTO),
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
        await axios
          .patch(`${BASE_URL}auth/user/avatar`, {
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
