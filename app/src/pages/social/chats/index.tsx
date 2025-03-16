import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ChatQuery, OptimisticMessage } from '@lib/queries/chatQuery.ts';
import { Input } from '@components/ui/input.tsx';
import { FormEvent, useEffect, useMemo, useRef } from 'react';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';
import { Button } from '@components/ui/button.tsx';
import { Loader2, Send } from 'lucide-react';
import ChatProvider, { useChatContext } from '@pages/social/chats/context.tsx';
import UserAvatar from '@components/UserAvatar.tsx';
import { useUserState } from '@stores/userStore.ts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@lib/utils.ts';
import { EmojiSelect } from '@components/ui/emojiSelect.tsx';

export default function ChatsPage() {
  return (
    <div className={'flex flex-col grow'}>
      <Routes>
        <Route path={'user/:userId'} element={<UserChatPage personalChat />} />
        <Route
          index
          element={
            <div>
              <h1>Chats</h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

function ChatMessages() {
  const { chatId, isPersonalChat } = useChatContext();
  const listRef = useRef<HTMLUListElement>(null);
  const { data } = ChatQuery.useMessages({
    chatId,
    isPersonalChat,
  });

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
    });
  }, [listRef, data]);

  return (
    <motion.ul
      className={
        'max-h-[calc(100dvh-90px-3rem-48px-48px)] max-md:max-h-[calc(100dvh-90px-3rem-48px-48px-80px)] overflow-y-auto'
      }
      ref={listRef}>
      {data?.map((message, i) => (
        <ChatMessage
          key={message.id}
          message={message}
          isPrevSameUser={
            data[i - 1]?.author?.user_id === message.author?.user_id
          }
        />
      ))}
    </motion.ul>
  );
}

function ChatMessage({
  message,
  isPrevSameUser,
}: {
  message: OptimisticMessage;
  isPrevSameUser: boolean;
}) {
  return (
    <motion.li
      layout
      className={cn(
        'group relative flex gap-2 px-2 py-0.5 transition-colors hover:bg-border/50 rounded-md',
        !isPrevSameUser && 'mt-2',
        message.loading && 'animate-pulse !mt-0',
      )}>
      <div>
        {!isPrevSameUser && message.author ? (
          <div className={'flex gap-4 items-start'}>
            <UserAvatar
              userId={message.author.user_id}
              username={message.author.username}
              disabled={!message.author.has_avatar}
              className={'w-12 h-12 my-1'}
            />
            <div className={'space-y-1'}>
              <div className={'flex gap-2 items-end'}>
                <p className={'leading-5 font-medium'}>
                  {message.author.full_name || message.author.username}
                </p>
                <p
                  className={'text-muted-foreground text-xs'}
                  title={message.created_at}>
                  {format(new Date(message.created_at), 'P HH:mm')}
                </p>
              </div>
              <div className={'select-text break-all'}>{message.content}</div>
            </div>
          </div>
        ) : (
          <div className={'pl-16'}>
            <div
              className={cn(
                'flex items-center absolute top-0 bottom-0 left-0 pl-4 transition-opacity text-xs text-muted-foreground',
                !message.loading && 'opacity-0 group-hover:opacity-100',
              )}>
              {message.loading ? (
                <Loader2 className={'h-3 w-3 animate-spin'} />
              ) : (
                <p>{format(new Date(message.created_at), 'HH:mm')}</p>
              )}
            </div>
            <div className={'select-text break-all'}>{message.content}</div>
          </div>
        )}
      </div>
    </motion.li>
  );
}

function ChatHeader() {
  const { chat, getPartner } = useChatContext();
  const partner = useMemo(getPartner, [chat]);

  return (
    <div
      className={
        'flex items-center gap-2 bg-popover/70 backdrop-blur-lg p-2 rounded-full animate-fade-in'
      }>
      {partner && (
        <div className={'animate-fade-in-left delay-100'}>
          <UserAvatar
            disabled={!partner.has_avatar}
            userId={partner.user_id}
            username={partner.username}
            className={'w-8 h-8'}
          />
        </div>
      )}
      <p className={'text-xl animate-fade-in-left delay-200'}>{chat.name}</p>
      <div className={'ml-auto mr-3'}>
        {!partner && (
          <p className={'text-sm text-muted-foreground'}>
            {chat.members.length} members
          </p>
        )}
      </div>
    </div>
  );
}

function UserChatPage({ personalChat }: { personalChat: boolean }) {
  const { userId } = useParams();
  const user = useUserState(s => s.user);
  if (!userId || !user) return <Navigate to={'/social/chats'} />;

  const { data } = ChatQuery.useChatSuspense({
    chatId: userId,
    isPersonalChat: personalChat,
  });

  return (
    <ChatProvider
      chatId={userId}
      isPersonalChat={personalChat}
      chat={data}
      user={user}>
      <div className={'flex flex-col grow'}>
        <ChatHeader />
        <div className={'mb-2 mt-auto'}>
          <ChatMessages />
        </div>
        <WriteMessageForm />
      </div>
    </ChatProvider>
  );
}

function WriteMessageForm() {
  const { chatId, chat } = useChatContext();
  const { mutate } = ChatQuery.useSendMessageMutationOptimistic(chatId, true);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const content: string = form.content.value;

    if (!content) {
      form.content.focus();
      return;
    }

    form.reset();
    mutate(content);
  }

  const handleEmojiSelect = (e: string) => {
    const input = inputRef.current;
    if (!input) return;
    input.value = input.value + e;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={'flex items-center gap-2 relative h-11'}>
      <Input
        ref={inputRef}
        type={'text'}
        name={'content'}
        className={'absolute inset-0 pr-24 p-2 !text-lg placeholder:text-sm'}
        placeholder={`Write a message to ${chat.name}`}
      />
      <div className={'absolute right-0.5 top-1 bottom-1 flex items-center'}>
        <EmojiSelect handleSelect={handleEmojiSelect} />
        <Button variant={'ghost'} className={'aspect-square'}>
          <Send />
        </Button>
      </div>
    </form>
  );
}

function DeleteMessageButton({ message }: { message: ChatMessageModelDTO }) {
  const { isPersonalChat, chatId } = useChatContext();
  const { mutate } = ChatQuery.useDeleteMessageMutationOptimistic(
    message,
    isPersonalChat,
    chatId,
  );

  return <button onClick={() => mutate()}>Delete</button>;
}
