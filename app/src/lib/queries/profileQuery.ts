import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import type { ProfileModelDTO } from '@bindings/ProfileModelDTO.ts';
import { type NotificationActions, Severity } from '@/stores/notificationStore';
import { queryClient } from '@lib/query.ts';

export class ProfileQuery {
  private static fetchProfileById(id: string | undefined) {
    return () =>
      axios
        .get(`${BASE_URL}auth/profile/${id}`)
        .then(res => res.data as ProfileModelDTO);
  }

  private static fetchProfileSelf() {
    return () =>
      axios
        .get(`${BASE_URL}auth/profile`)
        .then(res => res.data as ProfileModelDTO);
  }

  public static useProfileByIdSuspense = (id?: string) => {
    return useSuspenseQuery({
      queryFn: this.fetchProfileById(id),
      queryKey: ['profile', id],
    });
  };

  public static useProfileSelfSuspense = () => {
    return useSuspenseQuery({
      queryFn: this.fetchProfileSelf(),
      queryKey: ['profile', 'self'],
    });
  };

  public static prefetchProfileById = (id?: string) => {
    return queryClient.prefetchQuery({
      queryKey: ['profile', id],
      queryFn: this.fetchProfileById(id),
    });
  };

  public static prefetchProfileSelf = () => {
    return queryClient.prefetchQuery({
      queryKey: ['profile', 'self'],
      queryFn: this.fetchProfileSelf(),
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
