import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { TrashIcon } from '@heroicons/react/24/outline';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

export function AlbumDelete({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const notifications = useNotifications(s => s.actions);
  const navigate = useNavigate();
  const context = useContext(DisplayContext);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notifications.notify({
        title: 'Delete Album',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });
      await axios
        .delete(`${BASE_URL}auth/album/${id}`)
        .then(() => {
          navigate('/home/album');
          AlbumQuery.invalidateAlbums().then();
          notifications.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(() => {
          notifications.updateNotification(deleteId, {
            severity: Severity.ERROR,
            status: 'Error',
            canDismiss: true,
          });
        });
      onClose();
    },
  });

  if (context.shareUuid) return null;

  return (
    <button
      className={
        'menu-button w-full bg-red-200/30 text-red-700 hover:bg-red-200/50 dark:bg-red-800/30 dark:text-red-500 dark:hover:bg-red-800/50'
      }
      disabled={deleteAction.isPending}
      onClick={() => deleteAction.mutate()}>
      <TrashIcon className={'h-5 w-5'} />
      Delete
    </button>
  );
}
