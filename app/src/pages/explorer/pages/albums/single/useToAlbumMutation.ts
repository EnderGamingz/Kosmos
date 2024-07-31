import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';

export const useToAlbumMutation = (albumId?: string) => {
  const notifications = useNotifications(s => s.actions);

  return useMutation({
    mutationFn: async ({
      add,
      remove,
      overwriteId,
    }: {
      add: string[];
      remove: string[];
      overwriteId?: string;
    }) => {
      const id = albumId || overwriteId;
      if (!id) return;
      const updateId = notifications.notify({
        title: 'Update album',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      const actions = [];
      if (add.length > 0) {
        actions.push(
          axios.put(`${BASE_URL}auth/album/${id}/link`, {
            file_ids: add,
          }),
        );
      }
      if (remove.length > 0) {
        actions.push(
          axios.put(`${BASE_URL}auth/album/${id}/unlink`, {
            file_ids: remove,
          }),
        );
      }

      Promise.all(actions)
        .then(() => {
          AlbumQuery.invalidateAlbum(id!).then();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Updated',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(e => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: e.response.data.message,
            canDismiss: true,
            timeout: 1000,
          });
        });
    },
  });
};
