import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { queryClient } from '@lib/query.ts';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';

export class ChatQuery {
  public static useMessages = ({
    chatId,
    page = 0,
    isPersonalChat,
  }: {
    chatId: string;
    page?: number;
    isPersonalChat?: boolean;
  }) => {
    const section = isPersonalChat ? 'user' : 'group';
    return useQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/social/chat/${section}/${chatId}/messages`, {
            params: {
              page,
            },
          })
          .then(res => res.data as ChatMessageModelDTO[]),
      queryKey: ['chat', chatId],
    });
  };

  public static sendMessageRequest = ({
    chatId,
    content,
    parentId,
    isPersonalChat,
  }: {
    chatId: string;
    content: string;
    parentId?: string;
    isPersonalChat?: boolean;
  }) => {
    const section = isPersonalChat ? 'user' : 'group';
    return axios.post(`${BASE_URL}auth/social/chat/${section}/${chatId}`, {
      content,
      parent_id: parentId,
    });
  };

  public static deleteMessageRequest = ({
    chatId,
    messageId,
    isPersonalChat,
  }: {
    chatId: string;
    messageId: string;
    isPersonalChat?: boolean;
  }) => {
    const section = isPersonalChat ? 'user' : 'group';
    return axios.delete(`${BASE_URL}auth/social/chat/${section}/${chatId}`, {
      data: {
        message_id: messageId,
      },
    });
  };

  public static invalidateChat = (id: string) => {
    return queryClient.invalidateQueries({
      queryKey: ['chat', id],
    });
  };
}
