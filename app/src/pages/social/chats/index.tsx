import { Link, Route, Routes } from 'react-router-dom';
import { UserChatPage } from '@pages/social/chats/chat';
import { SocialPageMetadata } from '@components/metadata.tsx';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { useUserState } from '@stores/userStore.ts';
import { useMemo } from 'react';
import UserAvatar from '@components/UserAvatar.tsx';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@lib/utils.ts';
import { Button } from '@components/ui/button.tsx';
import { Plus, User, Users } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { PopoverClose } from '@radix-ui/react-popover';

export default function ChatsRouter() {
  return (
    <div className={'flex flex-col grow'}>
      <Routes>
        <Route path={'user/:userId'} element={<UserChatPage personalChat />} />
        <Route index element={<ChatsHome />} />
      </Routes>
    </div>
  );
}

function ChatsHome() {
  return (
    <div className={'space-y-4 gap-4'}>
      <SocialPageMetadata title={'Chats'} />
      <div className={'flex justify-between'}>
        <div>
          <h1 className={'text-3xl animate-fade-in-top'}>Chats</h1>
          <p className={'text-muted-foreground animate-fade-in-top delay-100'}>
            Your most recent chats are shown here.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Plus />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={'flex flex-col gap-2 p-2 max-w-40'}>
            <PopoverClose>
              <Link className={'menu-button'} to={'/social/contacts'}>
                <User />
                Contact
              </Link>
            </PopoverClose>
            <PopoverClose>
              <div
                className={
                  'menu-button text-muted-foreground opacity-50 bg-border hover:bg-border cursor-not-allowed'
                }>
                <Users />
                <div className={'text-start -space-y-2.5'}>
                  <p>Group</p>
                  <small>Coming soon</small>
                </div>
              </div>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
      <FetchBoundary fetchGoal={'chats'}>
        <ChatList />
      </FetchBoundary>
    </div>
  );
}

export function ChatList({ preview }: { preview?: boolean }) {
  const user = useUserState(s => s.user);
  const { data } = ChatQuery.useChatsSuspense({
    limit: preview ? 8 : undefined,
  });

  return (
    <>
      {preview && !!data.length && (
        <div>
          <h2 className={'text-xl animate-fade-in-top'}>Recent chats</h2>
        </div>
      )}
      <ul
        className={cn(
          'animate-fade-in-top delay-200',
          preview
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-2 max-h-[calc(100dvh-90px-2.5rem-36px-1rem)] max-md:max-h-[calc(100dvh-90px-2.5rem-36px-1rem-80px)] overflow-y-auto divide-y grow',
        )}>
        {data?.map(chat => (
          <ChatItem
            key={chat.id}
            chat={chat}
            userId={user?.id}
            small={preview}
          />
        ))}
      </ul>
    </>
  );
}

function ChatItem({
  chat,
  userId,
  small,
}: {
  chat: ChatModelDTO;
  userId?: string;
  small?: boolean;
}) {
  const isPersonalChat = chat.chat_type === 'Personal';

  const partnerInfo = useMemo(() => {
    if (!isPersonalChat) return undefined;
    return chat.members.find(u => u.user_id !== userId);
  }, []);

  const url = isPersonalChat
    ? `/social/chats/user/${partnerInfo?.user_id}`
    : `/social/chats/group/${chat.id}`;

  return (
    <li>
      <Link
        to={url}
        className={cn(
          'p-2 flex gap-3 hover:bg-border rounded-md shadow transition-colors',
          small && 'flex-col border',
        )}>
        {partnerInfo && (
          <UserAvatar
            username={partnerInfo.username}
            userId={partnerInfo.user_id}
            disabled={!partnerInfo.has_avatar}
            className={cn('w-10 h-10', small && 'w-14 h-14')}
          />
        )}
        <div className={cn('flex justify-between w-full', small && 'flex-col')}>
          <p className={'text-xl truncate'}>{chat.name}</p>
          <p className={'text-sm text-muted-foreground'}>
            {chat.latest_message_at
              ? `${!small ? 'Active' : ''} ${formatDistanceToNow(
                  new Date(chat.latest_message_at),
                  {
                    addSuffix: true,
                  },
                )}`
              : 'No messages yet'}
          </p>
        </div>
      </Link>
    </li>
  );
}
