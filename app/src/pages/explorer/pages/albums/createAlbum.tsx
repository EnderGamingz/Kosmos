import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import type { CreateAlbumPayload } from '@models/album.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import type { FormEvent } from 'react';
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
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import { Check, Plus } from 'lucide-react';

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
      <Button size={'sm'} onClick={onOpen}>
        <Plus />
        Create Album
      </Button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className={'space-y-4 [&_label]:block [&_input]:mt-2'}
          >
            <div>
              <label className={'font-medium'} htmlFor={'name'}>
                Name <span className={'text-red-500'}>*</span>
              </label>
              <Input
                name={'name'}
                id={'name'}
                autoComplete={'off'}
                type={'text'}
                placeholder={'Album name'}
                required
              />
            </div>
            <div>
              <label className={'font-medium'} htmlFor={'description'}>
                Description
              </label>
              <Input
                name={'description'}
                id={'description'}
                autoComplete={'off'}
                type={'text'}
                placeholder={'Album description'}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant={'outline'}
                  disabled={createMutation.isPending}
                  type={'button'}
                  className={'mr-auto'}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type={'submit'}>
                <Check />
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
