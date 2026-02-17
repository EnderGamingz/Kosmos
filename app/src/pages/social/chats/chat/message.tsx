import { useEffect, useRef, useState } from 'react';
import { useChatContext } from '@pages/social/chats/context.tsx';
import { ChatQuery, type OptimisticMessage } from '@lib/queries/chatQuery.ts';
import { useDebounce } from '@hooks/useDebounce.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@lib/utils.ts';
import { CornerUpRight, Loader2, Pen, Reply, Trash } from 'lucide-react';
import UserAvatar from '@components/UserAvatar.tsx';
import { format } from 'date-fns';
import { Button } from '@components/ui/button.tsx';
import type { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';

export function ChatMessages() {
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
        'pt-10 overflow-y-auto',
        'max-h-[calc(100dvh-110px-3rem-48px-48px)] max-md:max-h-[calc(100dvh-110px-3rem-48px-48px-80px)]',
      )}
      ref={listRef}
    >
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

export function ChatMessage({
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
  isPrevSameUser?: boolean;
  isHover?: boolean;
  setHover?: (id?: string) => void;
  isFromCurrentUser?: boolean;
  onReplyTo?: () => void;
  activeReply?: boolean;
  activeEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <motion.li
      onMouseEnter={() => setHover?.(message.id)}
      onMouseLeave={() => setHover?.(undefined)}
      className={cn(
        'group relative px-2 py-0.5 transition-all hover:bg-border/50 rounded-md',
        'outline -outline-offset-2',
        !isPrevSameUser && 'mt-2',
        message.loading && 'animate-pulse',
        message.loading && 'mt-0!',
        activeReply || activeEdit ? 'outline-border' : 'outline-transparent',
      )}
    >
      <AnimatePresence>
        {isHover && !message.loading && (
          <motion.div
            layout
            layoutId={'message-action'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={
              'absolute right-3 -top-5 flex gap-1 p-1 bg-popover rounded-md shadow'
            }
          >
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
          }
        >
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
            title={message.parent.content}
          >
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
              <div
                className={
                  'flex gap-2 items-end max-sm:flex-col max-sm:items-start'
                }
              >
                <p className={'leading-5 font-medium'}>
                  {message.author.full_name || message.author.username}
                </p>
                <p
                  className={'text-muted-foreground text-xs'}
                  title={message.created_at}
                >
                  {message.loading ? (
                    <Loader2 className={'h-3 w-3 animate-spin mb-1'} />
                  ) : (
                    format(new Date(message.created_at), 'P HH:mm')
                  )}
                  {message.is_edited && (
                    <span
                      className={'text-muted-foreground text-xs select-none'}
                    >
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
              )}
            >
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

function EditMessageButton({
  onClick,
  active,
}: {
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'ghost'}
      size={'sm'}
      className={'p-1! aspect-square'}
    >
      <Pen />
    </Button>
  );
}

function ReplyToButton({
  onClick,
  active,
}: {
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'ghost'}
      size={'sm'}
      className={'p-1! aspect-square'}
    >
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
      className={'p-1! aspect-square'}
    >
      <Trash />
    </Button>
  );
}
