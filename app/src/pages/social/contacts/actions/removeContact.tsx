import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
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
import { UserMinus } from 'lucide-react';
import { Button } from '@components/ui/button.tsx';

export function RemoveContact({
  profile,
}: {
  profile: ProfileContactModelDTO;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => ContactQuery.removeContactRequest(profile.user_id),
    onSuccess: () => {
      setOpen(false);
      ContactQuery.invalidateContact().then();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={'menu-button w-full'}>
          <UserMinus className={'w-5 h-5'} />
          Remove Contact
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Remove{' '}
            <span className={'px-1.5 py-0.5 border rounded-md bg-muted'}>
              {profile.full_name ?? profile.username}
            </span>{' '}
            as a contact?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{' '}
            {profile.full_name ?? profile.username} as a contact?
            <br />
            This action cannot be undone and you will have to re-add them as a
            contact if you change your mind.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button
              variant={'destructive'}
              onClick={() => mutate()}
              disabled={isPending}>
              <UserMinus /> Remove Contact
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
