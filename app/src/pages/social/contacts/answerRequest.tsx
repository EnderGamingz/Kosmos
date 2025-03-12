import { ProfileContactPendingModelDTO } from '@bindings/ProfileContactPendingModelDTO.ts';
import UserAvatar from '@components/UserAvatar.tsx';
import { useMutation } from '@tanstack/react-query';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { Button } from '@components/ui/button.tsx';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnswerRequest({
  request,
}: {
  request: ProfileContactPendingModelDTO;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ accept }: { accept: boolean }) =>
      ContactQuery.answerRequest(request.id, accept),
    onSuccess: () => {
      ContactQuery.invalidateContact().then();
    },
  });

  return (
    <div className={'flex gap-2 max-sm:flex-col max-sm:gap-1'}>
      <Button
        variant={'outline'}
        onClick={() => mutate({ accept: true })}
        disabled={isPending}
        size={'sm'}>
        <Check />
        Accept
      </Button>
      <Button
        variant={'destructive'}
        onClick={() => mutate({ accept: false })}
        disabled={isPending}
        size={'sm'}>
        <X />
        Decline
      </Button>
    </div>
  );
}

export function CancelRequestButton({
  request,
}: {
  request: ProfileContactPendingModelDTO;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => ContactQuery.cancelRequest(request.id),
    onSuccess: () => {
      ContactQuery.invalidateContact().then();
    },
  });
  return (
    <Button
      variant={'outline'}
      onClick={() => mutate()}
      disabled={isPending}
      size={'sm'}>
      Cancel
    </Button>
  );
}

export function ContactRequestListItem({
  request,
  type,
}: {
  request: ProfileContactPendingModelDTO;
  type: 'sent' | 'received';
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}>
      <div
        className={
          'flex gap-2 p-2 rounded-md transition-colors hover:bg-border'
        }>
        <UserAvatar
          userId={request.user_id}
          username={request.username}
          className={'w-14 h-14'}
        />
        <div>
          <p>{request.full_name ?? request.username}</p>
          <p className={'text-muted-foreground'}>{request.status}</p>
        </div>
        <div className={'ml-auto [&_button]:cursor-pointer'}>
          {type === 'sent' ? (
            <CancelRequestButton request={request} />
          ) : (
            <AnswerRequest request={request} />
          )}
        </div>
      </div>
    </motion.li>
  );
}
