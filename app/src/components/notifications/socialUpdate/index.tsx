import {
  SOCIAL_UPDATE_TIMEOUT,
  useSocialUpdate,
} from '@stores/socialUpdateStore.ts';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@lib/utils.ts';
import { Button, buttonVariants } from '@components/ui/button.tsx';
import { getChatUrl } from '@utils/social/getChatUrl.ts';
import { ExternalLink, MessagesSquare, X } from 'lucide-react';
import { ChatMessage } from '@pages/social/chats/chat/message.tsx';
import { useEffect, useState } from 'react';
import { Progress } from '@components/ui/progress.tsx';

export default function SocialUpdateOverlay() {
  const { chatMessage, clearChatMessage } = useSocialUpdate();
  const location = useLocation();

  const shouldShow = !!chatMessage;

  const shouldShowChatMessage =
    chatMessage && !location.pathname.includes(chatMessage.chat_id);

  useEffect(() => {
    if (chatMessage && !shouldShowChatMessage) clearChatMessage();
  });

  return (
    <div
      className={cn(
        'fixed top-2 left-2 max-sm:right-2 max-w-sm sm:w-full flex flex-col gap-2 z-50',
        !shouldShow && 'pointer-events-none',
      )}
    >
      <AnimatePresence>
        {chatMessage && shouldShowChatMessage && (
          <NewChatMessage key={'chat-message'} message={chatMessage} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewChatMessage({ message }: { message: PresenceNewChatMessage }) {
  const [left, setLeft] = useState(SOCIAL_UPDATE_TIMEOUT);
  const close = useSocialUpdate(s => s.clearChatMessage);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(close, SOCIAL_UPDATE_TIMEOUT);
    return () => clearTimeout(id);
  }, [close]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLeft(l => l - 1000);
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={
        'bg-background gap-1 rounded-md border shadow-lg overflow-hidden'
      }
    >
      <div className={'p-1'}>
        <div className={'flex justify-between px-2 gap-2'}>
          {message.content.author && (
            <div className={'flex gap-2 items-center grow'}>
              <MessagesSquare className={'animate-fade-in-left'} />
              <div className={'-space-y-1 w-full'}>
                <div className={'flex w-full'}>
                  <p
                    className={
                      'text-xl animate-fade-in-left delay-50 truncate w-0 grow'
                    }
                  >
                    {message.content.author.full_name ??
                      message.content.author.username}
                  </p>
                </div>
                <p
                  className={
                    'text-muted-foreground text-xs animate-fade-in-left delay-100'
                  }
                >
                  Wrote a message
                </p>
              </div>
            </div>
          )}
          <div className={'flex gap-1'}>
            <Link
              onClick={close}
              className={cn(
                'animate-fade-in-right delay-200',
                buttonVariants({ size: 'sm', variant: 'outline' }),
              )}
              to={getChatUrl(
                message.chat_type === 'Personal',
                message.chat_id,
                message.chat_id,
              )}
            >
              <ExternalLink className={'w-4!'} />
            </Link>
            <Button
              size={'sm'}
              onClick={close}
              className={'animate-fade-in-right delay-100'}
            >
              <X />
            </Button>
          </div>
        </div>
        <hr className={'my-1 animate-fade-in-top delay-200'} />
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: Should be clickable */}
        <ul
          className={'*:m-0! cursor-pointer animate-fade-in-top delay-300'}
          onClick={() => {
            navigate(
              getChatUrl(
                message.chat_type === 'Personal',
                message.chat_id,
                message.chat_id,
              ),
            );
            close();
          }}
        >
          <ChatMessage message={message.content} />
        </ul>
      </div>
      <Progress
        className={'h-1 animate-fade-in-bottom delay-300'}
        value={(left / SOCIAL_UPDATE_TIMEOUT) * 100}
      />
    </motion.div>
  );
}
