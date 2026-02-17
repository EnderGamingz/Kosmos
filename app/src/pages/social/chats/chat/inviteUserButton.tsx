import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { Plus } from 'lucide-react';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import type { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import UserAvatar from '@components/UserAvatar.tsx';
import { useMutation } from '@tanstack/react-query';
import { useChatContext } from '@pages/social/chats/context.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';

export function InviteUserButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={'sm'}>
          <Plus /> Invite
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <FetchBoundary fetchGoal={'contacts'}>
          <InviteUserPopoverContent />
        </FetchBoundary>
      </PopoverContent>
    </Popover>
  );
}

function InviteUserPopoverContent() {
  const { chatId } = useChatContext();
  const { data } = ChatQuery.useAvailableUsersForGroupChatSuspense({ chatId });

  return (
    <div className={'divide-y'}>
      {data?.map(user => (
        <UserItem key={user.user_id} user={user} chatId={chatId} />
      ))}
      {data?.length === 0 && (
        <EmptyList message={'No users available to invite.'} />
      )}
    </div>
  );
}

function UserItem({
  user,
  chatId,
}: {
  user: ProfileContactModelDTO;
  chatId: string;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      ChatQuery.inviteUserToGroupChatRequest({ chatId, userId: user.user_id }),
    onSuccess: () => {
      ChatQuery.invalidateChatInfo(chatId).then();
      ChatQuery.invalidateAvailableUsersForGroupChat(chatId).then();
    },
  });

  const handleClick = () => {
    if (isPending) return;
    mutate();
  };

  return (
    <button
      type={'button'}
      onClick={handleClick}
      className={'text-start transition-colors hover:bg-border p-2 rounded-md'}
    >
      <div className={'flex gap-2'}>
        <UserAvatar
          disabled={!user.has_avatar}
          userId={user.user_id}
          username={user.username}
          className={'w-8 h-8'}
        />
        <div className={'overflow-hidden'}>
          <p className={'truncate'}>{user.full_name ?? user.username}</p>
          <p className={'text-sm text-muted-foreground underline'}>
            {isPending ? 'Inviting...' : 'Invite'}
          </p>
        </div>
      </div>
    </button>
  );
}
