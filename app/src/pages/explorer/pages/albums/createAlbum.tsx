import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { CreateAlbumPayload } from '@models/album.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { FormEvent } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CheckIcon } from '@heroicons/react/24/outline';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import useDisclosure from '@hooks/useDisclosure.ts';

export function CreateAlbum() {
  const notifications = useNotifications(s => s.actions);
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

  const createMutation = useMutation({
    mutationFn: async (payload: CreateAlbumPayload) => {
      const createId = notifications.notify({
        title: 'Create album',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .post(BASE_URL + 'auth/album', payload)
        .then(() => {
          notifications.updateNotification(createId, {
            severity: Severity.SUCCESS,
            status: 'Created',
            timeout: 1000,
            canDismiss: true,
          });
          AlbumQuery.invalidateAlbums().then();
          onClose();
        })
        .catch(() => {
          notifications.updateNotification(createId, {
            severity: Severity.ERROR,
            status: 'Error',
            canDismiss: true,
          });
        });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createMutation.isPending) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) return;

    createMutation.mutate({ name, description: description || undefined });
  }

  return (
    <>
      <button className={'btn-white btn-sm'} onClick={onOpen}>
        <PlusIcon />
        Create Album
      </button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className={'space-y-4 [&_label]:block [&_input]:mt-2'}>
            <div>
              <label className={'font-medium'} htmlFor={'name'}>
                Name <span className={'text-red-500'}>*</span>
              </label>
              <input
                name={'name'}
                id={'name'}
                autoComplete={'off'}
                type={'text'}
                placeholder={'Album name'}
                className={'input w-full'}
                required
              />
            </div>
            <div>
              <label className={'font-medium'} htmlFor={'description'}>
                Description
              </label>
              <input
                name={'description'}
                id={'description'}
                autoComplete={'off'}
                type={'text'}
                placeholder={'Album description'}
                className={'input w-full'}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button
                  disabled={createMutation.isPending}
                  type={'button'}
                  className={'btn-white mr-auto'}>
                  Cancel
                </button>
              </DialogClose>
              <button type={'submit'} className={'btn-black'}>
                <CheckIcon />
                Create
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
