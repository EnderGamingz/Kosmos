import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { AlbumModel, UpdateAlbumPayload } from '@models/album.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateAlbum } from '@lib/query.ts';
import { FormEvent } from 'react';
import { motion } from 'framer-motion';

const useAlbumUpdateMutation = () => {
  const notifications = useNotifications(s => s.actions);
  return useMutation({
    mutationFn: async (payload: UpdateAlbumPayload) => {
      const updateId = notifications.notify({
        title: 'Update album',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .patch(`${BASE_URL}auth/album`, payload)
        .then(() => {
          invalidateAlbum(payload.id).then();
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

export function AlbumTitle({ album }: { album: AlbumModel }) {
  const update = useAlbumUpdateMutation();

  function handleAlbumUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (update.isPending) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    if (!name) return;

    if (name === album.name && description === album.description) return;

    update.mutate({
      id: album.id,
      name: name,
      description: description || undefined,
    });
  }

  return (
    <form
      className={'flex-grow'}
      onSubmit={handleAlbumUpdate}
      onBlur={handleAlbumUpdate}>
      <div className={'flex'}>
        <motion.input
          layout={'position'}
          layoutId={`album-name-${album.id}`}
          className={
            'bg-transparent text-2xl font-light outline-none sm:text-3xl md:text-4xl'
          }
          defaultValue={album.name}
          placeholder={'Album name'}
          name={'name'}
          type={'text'}
          required
        />
      </div>
      <motion.input
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={'bg-transparent font-light text-stone-500 outline-none'}
        defaultValue={album.description}
        placeholder={'Album description'}
        name={'description'}
        type={'text'}
      />
      <button className={'btn-black hidden'} type={'submit'}>
        Update
      </button>
    </form>
  );
}
