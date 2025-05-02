import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { UpdateAlbumPayload } from '@models/album.ts';
import { FormEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Button } from '@components/ui/button.tsx';
import { api } from '@/lib/queries/api';

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
      await api
        .patch(`auth/album`, payload)
        .then(() => {
          AlbumQuery.invalidateAlbum(payload.id).then();
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

export function AlbumTitle({
  album,
  children,
  dense = false,
  disabled,
}: {
  album: AlbumModelDTO;
  children?: ReactNode;
  dense?: boolean;
  disabled?: boolean;
}) {
  const update = useAlbumUpdateMutation();

  function handleAlbumUpdate(e: FormEvent<HTMLFormElement>) {
    if (disabled) return;
    e.preventDefault();
    if (update.isPending) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    if (!name) return;

    if (name === album.name && description === (album.description || ''))
      return;

    update.mutate({
      id: album.id,
      name: name,
      description: description || undefined,
    });
  }

  return (
    <div
      className={cn(
        'flex flex-grow flex-col gap-5 transition-all',
        dense && 'gap-1',
      )}>
      <form
        className={'flex-grow'}
        onSubmit={handleAlbumUpdate}
        onBlur={handleAlbumUpdate}>
        <div className={'flex'}>
          <motion.input
            layout={'position'}
            layoutId={`album-name-${album.id}`}
            disabled={disabled}
            title={album.name}
            className={cn(
              'w-0 flex-grow truncate transition-[font-size]',
              'bg-transparent text-2xl font-light outline-none sm:text-3xl md:text-4xl',
              Boolean(dense) && 'text-lg sm:text-xl md:text-2xl',
            )}
            defaultValue={album.name}
            placeholder={'Album name'}
            name={'name'}
            type={'text'}
            required
          />
        </div>
        <input
          className={cn(
            'bg-transparent font-light text-muted-foreground outline-none transition-[font-size] animate-fade-in-top animation-delay-300',
            Boolean(dense) && 'text-sm',
          )}
          defaultValue={album.description || ''}
          title={album.description || ''}
          disabled={disabled}
          placeholder={!disabled ? 'Album description' : ''}
          name={'description'}
          type={'text'}
        />
        <Button className={'sr-only'} type={'submit'}>
          Update
        </Button>
      </form>
      <AnimatePresence>
        {!dense && (
          <div className={'animate-fade-in-top delay-400'}>{children}</div>
        )}
      </AnimatePresence>
    </div>
  );
}
