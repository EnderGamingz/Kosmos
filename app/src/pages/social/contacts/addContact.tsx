import { type FormEvent, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { Plus, UserPlus } from 'lucide-react';
import { Input } from '@components/ui/input.tsx';
import { useMutation } from '@tanstack/react-query';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';

export function AddContact() {
  const [open, setOpen] = useState(false);
  const notification = useNotifications(s => s.actions);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username }: { username: string }) =>
      ContactQuery.sendRequest(username).catch(e => {
        notification.notify({
          title: 'Add Contact',
          severity: Severity.ERROR,
          status: 'Error',
          description: e.response?.data?.error || 'Error',
          canDismiss: true,
          timeout: 5000,
        });
      }),
    onSuccess: () => {
      setOpen(false);
      ContactQuery.invalidateContact().then();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    if (!username) return;
    mutate({ username });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size={'sm'} className={'animate-fade-in-top delay-200'}>
          <Plus />
          Add Contact
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          onSubmit={handleSubmit}
          className={'flex items-center gap-1 group'}
        >
          <Input name={'username'} placeholder={'Enter a username'} required />
          <Button
            type={'submit'}
            disabled={isPending}
            className={'group-invalid:cursor-not-allowed '}
          >
            <UserPlus />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
