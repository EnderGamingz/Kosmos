import { Navigate, useParams } from 'react-router-dom';
import { useUserState } from '@stores/userStore.ts';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import ChatProvider from '@pages/social/chats/context.tsx';
import { ChatHeader } from '@pages/social/chats/chat/chatHeader.tsx';
import { ChatMessages } from '@pages/social/chats/chat/message.tsx';
import { WriteMessageForm } from '@pages/social/chats/chat/writeMessageForm.tsx';

export function UserChatPage({ personalChat }: { personalChat: boolean }) {
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
