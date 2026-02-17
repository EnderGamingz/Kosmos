import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { type NotificationActions, Severity } from '@/stores/notificationStore';
import { queryClient } from '@lib/query.ts';
import type { PushSubscriptionModelDTO } from '@bindings/PushSubscriptionModelDTO.ts';
import type { CreateNotificationSubscriptionRequest } from '@bindings/CreateNotificationSubscriptionRequest.ts';

export class PushQuery {
  public static usePushSubscriptionsSuspense = () => {
    return useSuspenseQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/notification/subscription`)
          .then(res => res.data as PushSubscriptionModelDTO[]),
      queryKey: ['push', 'subscriptions'],
    });
  };

  public static useCreateSubscriptionMutation(
    notifications: NotificationActions,
  ) {
    return useMutation({
      mutationFn: async ({
        subscription,
        updateId,
      }: {
        subscription: CreateNotificationSubscriptionRequest;
        updateId: string;
      }) => {
        notifications.updateNotification(updateId, {
          severity: Severity.INFO,
          status: 'Negotiating with server',
          loading: true,
          canDismiss: false,
        });
        await axios
          .post(`${BASE_URL}auth/notification/subscription`, subscription)
          .then(() => {
            notifications.updateNotification(updateId, {
              severity: Severity.SUCCESS,
              status: 'Created',
              timeout: 1000,
              canDismiss: true,
            });
            PushQuery.invalidateSubscriptions();
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

  public static useDeleteSubscriptionMutation(
    notifications: NotificationActions,
  ) {
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => {
        const updateId = notifications.notify({
          title: 'Deleting Push Subscription',
          severity: Severity.INFO,
          loading: true,
          canDismiss: false,
        });
        await axios
          .delete(`${BASE_URL}auth/notification/subscription/${id}`, {})
          .then(() => {
            notifications.updateNotification(updateId, {
              severity: Severity.SUCCESS,
              status: 'Deleted',
              timeout: 1000,
              canDismiss: true,
            });
            PushQuery.invalidateSubscriptions();
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

  public static invalidateSubscriptions = () =>
    queryClient.invalidateQueries({
      queryKey: ['push', 'subscriptions'],
    });
}
