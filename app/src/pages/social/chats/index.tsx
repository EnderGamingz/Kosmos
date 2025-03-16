import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { Input } from '@components/ui/input.tsx';
import { FormEvent } from 'react';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';
import { useMutation } from '@tanstack/react-query';

export default function ChatsPage() {
  return (
    <div>
      <Routes>
        <Route path={'user/:userId'} element={<UserChatPage />} />
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

function UserChatPage() {
  const { userId } = useParams();
  if (!userId) return <Navigate to={'/social/chats'} />;

  const { data } = ChatQuery.useMessages({
    chatId: userId,
    isPersonalChat: true,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const form = e.target as HTMLFormElement;
    const content = form.content.value;
    ChatQuery.sendMessageRequest({
      chatId: userId,
      content,
      isPersonalChat: true,
    }).then(() => {
      ChatQuery.invalidateChat(userId);
    });
  }

  return (
    <div className={'divide-y'}>
      {data?.map(message => (
        <div key={message.id} className={'flex justify-between'}>
          <div>{message.content}</div>
          <div>{message.author?.full_name || message.author?.username}</div>
          <DeleteMessageButton
            message={message}
            isPersonalChat={true}
            chatId={userId}
          />
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <Input type={'text'} name={'content'} />
      </form>
    </div>
  );
}

function DeleteMessageButton({
  message,
  isPersonalChat,
  chatId,
}: {
  message: ChatMessageModelDTO;
  isPersonalChat: boolean;
  chatId: string;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      ChatQuery.deleteMessageRequest({
        chatId: message.chat_id,
        messageId: message.id,
        isPersonalChat: isPersonalChat,
      }),
    onSuccess: () => {
      ChatQuery.invalidateChat(chatId);
    },
  });
  return <button onClick={() => mutate()}>Delete</button>;
}
