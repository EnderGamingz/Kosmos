import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ChatQuery, OptimisticMessage } from '@lib/queries/chatQuery.ts';
import { Input } from '@components/ui/input.tsx';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';
import { Button } from '@components/ui/button.tsx';
import {
  CornerUpRight,
  Loader2,
  Pen,
  Reply,
  Send,
  Trash,
  X,
} from 'lucide-react';
import ChatProvider, { useChatContext } from '@pages/social/chats/context.tsx';
import UserAvatar from '@components/UserAvatar.tsx';
import { useUserState } from '@stores/userStore.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@lib/utils.ts';
import { EmojiSelect } from '@components/ui/emojiSelect.tsx';
import { useDebounce } from '@hooks/useDebounce.ts';

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
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>(
    undefined,
  );
  const {
    chatId,
    isPersonalChat,
    user,
    setReplyTo,
    replyTo,
    editMessage,
    setEditMessage,
  } = useChatContext();
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

  const { debouncedValue: debouncedHoveredMessage } = useDebounce(
    hoveredMessage,
    100,
  );

  return (
    <motion.ul
      className={cn(
        'max-h-[calc(100dvh-110px-3rem-48px-48px)] max-md:max-h-[calc(100dvh-110px-3rem-48px-48px-80px)] overflow-y-auto',
      )}
      ref={listRef}>
      {data?.map((message, i) => (
        <ChatMessage
          key={message.id}
          message={message}
          isPrevSameUser={
            data[i - 1]?.author?.user_id === message.author?.user_id
          }
          isHover={debouncedHoveredMessage === message.id}
          setHover={setHoveredMessage}
          isFromCurrentUser={message.author?.user_id === user.id}
          onReplyTo={() =>
            setReplyTo(replyTo === message ? undefined : message)
          }
          activeReply={replyTo === message}
          activeEdit={editMessage === message}
          onEdit={() =>
            setEditMessage(editMessage === message ? undefined : message)
          }
        />
      ))}
    </motion.ul>
  );
}

function ChatMessage({
  message,
  isPrevSameUser,
  isHover,
  setHover,
  isFromCurrentUser,
  onReplyTo,
  activeReply,
  activeEdit,
  onEdit,
}: {
  message: OptimisticMessage;
  isPrevSameUser: boolean;
  isHover: boolean;
  setHover: (id?: string) => void;
  isFromCurrentUser: boolean;
  onReplyTo: () => void;
  activeReply: boolean;
  activeEdit: boolean;
  onEdit: () => void;
}) {
  return (
    <motion.li
      onMouseEnter={() => setHover(message.id)}
      onMouseLeave={() => setHover(undefined)}
      className={cn(
        'group relative px-2 py-0.5 transition-all hover:bg-border/50 rounded-md',
        'outline -outline-offset-2',
        !isPrevSameUser && 'mt-2',
        message.loading && 'animate-pulse',
        message.loading && isPrevSameUser && '!mt-0',
        activeReply || activeEdit ? 'outline-border' : 'outline-transparent',
      )}>
      <AnimatePresence>
        {isHover && (
          <motion.div
            layout
            layoutId={'message-action'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={
              'absolute right-3 -top-5 flex gap-1 p-1 bg-popover rounded-md'
            }>
            <ReplyToButton onClick={onReplyTo} active={activeReply} />
            {isFromCurrentUser && (
              <EditMessageButton onClick={onEdit} active={activeEdit} />
            )}
            {isFromCurrentUser && <DeleteMessageButton message={message} />}
          </motion.div>
        )}
      </AnimatePresence>
      {message.parent && (
        <div
          className={
            'flex items-start gap-2 text-sm text-muted-foreground pl-5 h-6 mt-2'
          }>
          <CornerUpRight className={'mt-auto w-5 h-5'} />

          {message.parent.author && (
            <div className={'ml-2 flex gap-2 items-center'}>
              <UserAvatar
                userId={message.parent.author.user_id}
                username={message.parent.author.username}
                disabled={!message.parent.author.has_avatar}
                className={'w-5 h-5'}
              />
              <p>
                {message.parent.author.full_name ||
                  message.parent.author.username}
              </p>
              &middot;
            </div>
          )}
          <p
            className={'truncate leading-6 w-0 grow'}
            title={message.parent.content}>
            {message.parent.content}
          </p>
        </div>
      )}
      <div className={'flex'}>
        {(!isPrevSameUser || message.parent) && message.author ? (
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
                  {message.loading ? (
                    <Loader2 className={'h-3 w-3 animate-spin mb-1'} />
                  ) : (
                    format(new Date(message.created_at), 'P HH:mm')
                  )}
                  {message.is_edited && (
                    <span
                      className={'text-muted-foreground text-xs select-none'}>
                      {' '}
                      (edited)
                    </span>
                  )}
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
            <div className={'select-text break-all'}>
              {message.content}
              {message.is_edited && (
                <span className={'text-muted-foreground text-xs select-none'}>
                  {' '}
                  (edited)
                </span>
              )}
            </div>
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

function ActionBanner({ message }: { message: ChatMessageModelDTO }) {
  const { setReplyTo, setEditMessage, replyTo, editMessage } = useChatContext();
  const isReplying = replyTo === message;
  const isEditing = editMessage === message;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={
        'absolute -top-7 z-0 h-10 px-2 rounded-t-md bg-popover border w-full text-muted-foreground'
      }>
      <div className={'flex items-center justify-between h-7'}>
        <div className={'flex items-center gap-2'}>
          <Button
            type={'button'}
            variant={'ghost'}
            className={'!p-0 w-6 h-6'}
            onClick={() => {
              isReplying ? setReplyTo(undefined) : setEditMessage(undefined);
            }}>
            <X />
          </Button>
          <p className={'text-sm'}>
            {isReplying &&
              `Replying to message from ${message.author?.full_name || message.author?.username}`}
            {isEditing && 'Editing message'}
          </p>
        </div>
        {isReplying && <Reply className={'w-5 h-5'} />}
        {isEditing && <Pen className={'w-5 h-5'} />}
      </div>
    </motion.div>
  );
}

function WriteMessageForm() {
  const { chatId, chat, replyTo, setReplyTo, editMessage, setEditMessage } =
    useChatContext();
  const { mutate } = ChatQuery.useSendMessageMutationOptimistic(chatId, true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!!editMessage || !!replyTo) inputRef.current.focus();

    if (editMessage) inputRef.current.value = editMessage.content;
    else inputRef.current.value = '';
  }, [editMessage, replyTo]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const content: string = form.content.value;

    if (!content) {
      form.content.focus();
      return;
    }

    mutate({ content, parentId: replyTo?.id, editMessageId: editMessage?.id });
    form.reset();
    setReplyTo(undefined);
    setEditMessage(undefined);
  }

  const handleEmojiSelect = (e: string) => {
    const input = inputRef.current;
    if (!input) return;
    input.value = input.value + e;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-center gap-2 relative h-11 mt-5')}>
      <AnimatePresence>
        {(!!replyTo || !!editMessage) && (
          <ActionBanner message={(replyTo || editMessage)!} />
        )}
      </AnimatePresence>
      <Input
        ref={inputRef}
        type={'text'}
        name={'content'}
        className={
          'absolute inset-0 p-2 pr-24 !text-lg placeholder:text-sm z-10 bg-background'
        }
        placeholder={
          !!replyTo ? `Write a reply` : `Write a message to ${chat.name}`
        }
      />
      <div
        className={'absolute right-0.5 top-1 bottom-1 flex items-center z-10'}>
        <EmojiSelect handleSelect={handleEmojiSelect} />
        <Button type={'submit'} variant={'ghost'} className={'aspect-square'}>
          <Send />
        </Button>
      </div>
    </form>
  );
}

function EditMessageButton({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'ghost'}
      size={'sm'}
      className={'!p-1 aspect-square'}>
      <Pen />
    </Button>
  );
}

function ReplyToButton({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'ghost'}
      size={'sm'}
      className={'!p-1 aspect-square'}>
      <Reply />
    </Button>
  );
}

function DeleteMessageButton({ message }: { message: ChatMessageModelDTO }) {
  const { isPersonalChat, chatId } = useChatContext();
  const { mutate } = ChatQuery.useDeleteMessageMutationOptimistic(
    message,
    isPersonalChat,
    chatId,
  );

  return (
    <Button
      onClick={() => mutate()}
      variant={'ghost'}
      size={'sm'}
      className={'!p-1 aspect-square'}>
      <Trash />
    </Button>
  );
}
