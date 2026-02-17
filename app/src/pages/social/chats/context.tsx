import React, { type ReactNode, use, useEffect, useState } from 'react';
import type { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';
import type { ChatMemberModelDTO } from '@bindings/ChatMemberModelDTO.ts';
import type { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';
import { getPartner } from '@utils/social/getPartner.ts';

export type ChatContext = {
  chatId: string;
  chat: ChatModelDTO;
  isPersonalChat: boolean;
  user: UserModelDTO;
  getPartner: () => ChatMemberModelDTO | undefined;
  replyTo?: ChatMessageModelDTO;
  setReplyTo: (message?: ChatMessageModelDTO) => void;
  editMessage?: ChatMessageModelDTO;
  setEditMessage: (message?: ChatMessageModelDTO) => void;
};

const ChatContext = React.createContext<ChatContext | undefined>(undefined);

export const useChatContext = () => {
  const context = use(ChatContext);
  if (context === undefined)
    throw new Error('useChatContext must be used within a ChatProvider');

  return context;
};

export default function ChatProvider({
  children,
  chatId,
  chat,
  isPersonalChat,
  user,
}: {
  children: ReactNode;
  chatId: string;
  chat: ChatModelDTO;
  isPersonalChat: boolean;
  user: UserModelDTO;
}) {
  const [replyTo, setReplyTo] = useState<ChatMessageModelDTO | undefined>(
    undefined,
  );
  const [editMessage, setEditMessage] = useState<
    ChatMessageModelDTO | undefined
  >(undefined);

  useEffect(() => {
    if (replyTo) setEditMessage(undefined);
  }, [replyTo]);

  useEffect(() => {
    if (editMessage) setReplyTo(undefined);
  }, [editMessage]);

  return (
    <ChatContext
      value={{
        chatId,
        isPersonalChat,
        chat,
        user,
        getPartner: () => getPartner(isPersonalChat, chat, user),
        replyTo,
        setReplyTo,
        editMessage,
        setEditMessage,
      }}
    >
      {children}
    </ChatContext>
  );
}
