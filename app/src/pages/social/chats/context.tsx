import React, { ReactNode, use, useEffect, useState } from 'react';
import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';
import { ChatMemberModelDTO } from '@bindings/ChatMemberModelDTO.ts';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';

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
        getPartner: () => {
          if (!isPersonalChat)
            throw new Error('Cannot get partner of group chat');
          return chat.members.find(u => u.user_id !== user.id);
        },
        replyTo,
        setReplyTo,
        editMessage,
        setEditMessage,
      }}>
      {children}
    </ChatContext>
  );
}
