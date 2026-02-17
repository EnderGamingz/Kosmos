import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx';
import { Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Input } from '@components/ui/input.tsx';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function CreateGroupChat() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      ChatQuery.createGroupChatRequest({ name }),
    onSuccess: res => {
      ChatQuery.invalidateChats().then();
      setOpen(false);
      navigate(`/social/chats/group/${res.id}`);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name') as string;
    if (!name) return;
    mutate({ name });
    event.currentTarget.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={'menu-button'}>
          <Users />
          Group
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Start a new group chat with your friends.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={'space-y-5'}>
          <div>
            <label htmlFor={'name'} className={'text-sm'}>
              Group Name*
            </label>
            <Input
              id={'name'}
              type={'text'}
              name={'name'}
              required
              minLength={1}
              maxLength={100}
              placeholder={"What's the group name?"}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button type={'submit'}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
