import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { BASE_URL } from '@lib/env.ts';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';

const useUpdateAlbumPreview = (albumId: string, fileId: string) => {
  const notifications = useNotifications(s => s.actions);

  return useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Update album',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .put(`${BASE_URL}auth/album/${albumId}/preview`, {
          file_id: fileId,
        })
        .then(() => {
          AlbumQuery.invalidateAlbum(albumId).then();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Updated',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(err => {
          notifications.updateNotification(updateId, {
            status: 'Failed',
            description:
              err.response?.data?.error || err.response?.data || 'Error',
            severity: Severity.ERROR,
            canDismiss: true,
          });
        });
    },
  });
};

export default function SetAlbumPreview({
  album,
  fileId,
  onClose,
}: {
  album: AlbumModelDTO;
  fileId: string;
  onClose: () => void;
}) {
  const context = useContext(DisplayContext);

  const update = useUpdateAlbumPreview(album.id, fileId);

  if (context.shareUuid || album.preview_id === fileId) return null;

  const handleClick = () => {
    if (update.isPending) return;
    update.mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <button onClick={handleClick}>
      <PhotoIcon />
      Use as Preview
    </button>
  );
}
