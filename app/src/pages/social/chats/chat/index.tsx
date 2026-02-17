import { Navigate, useParams } from 'react-router-dom';
import { type User, useUserState } from '@stores/userStore.ts';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import ChatProvider from '@pages/social/chats/context.tsx';
import { ChatHeader } from '@pages/social/chats/chat/chatHeader.tsx';
import { ChatMessages } from '@pages/social/chats/chat/message.tsx';
import { WriteMessageForm } from '@pages/social/chats/chat/writeMessageForm.tsx';

export default function UserChatPage({
  personalChat,
}: {
  personalChat: boolean;
}) {
  const { userId, chatId } = useParams();
  const id = personalChat ? userId : chatId;
  const user = useUserState(s => s.user);
  if (!id || !user) return <Navigate to={'/social/chats'} />;

  return <Content id={id} personalChat={personalChat} user={user} />;
}

function Content({
  id,
  personalChat,
  user,
}: {
  id: string;
  personalChat: boolean;
  user: User;
}) {
  const { data } = ChatQuery.useChatSuspense({
    chatId: id,
    isPersonalChat: personalChat,
  });

  return (
    <ChatProvider
      chatId={id}
      isPersonalChat={personalChat}
      chat={data}
      user={user}
    >
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
