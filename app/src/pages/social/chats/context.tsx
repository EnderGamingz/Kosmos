import React, { ReactNode, use } from 'react';
import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';
import { ChatMemberModelDTO } from '@bindings/ChatMemberModelDTO.ts';

export type ChatContext = {
  chatId: string;
  chat: ChatModelDTO;
  isPersonalChat: boolean;
  user: UserModelDTO;
  getPartner: () => ChatMemberModelDTO | undefined;
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
      }}>
      {children}
    </ChatContext>
  );
}
