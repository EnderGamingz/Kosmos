import { useChatContext } from '@pages/social/chats/context.tsx';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { FormEvent, useEffect, useRef } from 'react';
import { cn } from '@lib/utils.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@components/ui/input.tsx';
import { EmojiSelect } from '@components/ui/emojiSelect.tsx';
import { Button } from '@components/ui/button.tsx';
import { Pen, Reply, Send, X } from 'lucide-react';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';

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

export function WriteMessageForm() {
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
