import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { queryClient } from '@lib/query.ts';
import { ChatMessageModelDTO } from '@bindings/ChatMessageModelDTO.ts';
import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';
import { PresenceDeletedChatMessage } from '@bindings/PresenceDeletedChatMessage.ts';
import { PresenceUpdatedChatMessage } from '@bindings/PresenceUpdatedChatMessage.ts';

export type OptimisticMessage = ChatMessageModelDTO & {
  loading?: boolean;
};

export class ChatQuery {
  public static useChatSuspense = ({
    chatId,
    isPersonalChat,
  }: {
    chatId: string;
    isPersonalChat: boolean;
  }) =>
    useSuspenseQuery({
      queryFn: () =>
        axios
          .get(
            `${BASE_URL}auth/social/chat/${
              isPersonalChat ? 'user' : 'group'
            }/${chatId}`,
          )
          .then(res => res.data as ChatModelDTO),
      queryKey: ['chat', 'info', chatId],
    });

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
          .then(res => res.data as ChatMessageModelDTO[])
          .then(messages => messages.reverse()),
      queryKey: ['chat', chatId],
    });
  };

  private static sendMessageRequest = ({
    chatId,
    content,
    parentId,
    isPersonalChat,
    editMessageId,
  }: {
    chatId: string;
    content: string;
    parentId?: string;
    isPersonalChat?: boolean;
    editMessageId?: string;
  }) => {
    const section = isPersonalChat ? 'user' : 'group';

    if (editMessageId) {
      return axios.patch(`${BASE_URL}auth/social/chat/${section}/${chatId}`, {
        content,
        message_id: editMessageId,
      });
    }

    return axios.post(`${BASE_URL}auth/social/chat/${section}/${chatId}`, {
      content,
      parent_id: parentId,
    });
  };

  public static useSendMessageMutationOptimistic(
    chatId: string,
    isPersonalChat: boolean,
  ) {
    return useMutation({
      mutationFn: ({
        content,
        parentId,
        editMessageId,
      }: {
        content: string;
        parentId?: string;
        editMessageId?: string;
      }) =>
        ChatQuery.sendMessageRequest({
          chatId,
          content,
          isPersonalChat,
          parentId,
          editMessageId,
        }),
      onMutate: async ({ content, parentId, editMessageId }) => {
        await queryClient.cancelQueries({
          queryKey: ['chat', chatId],
        });

        const previousMessages = queryClient.getQueryData([
          'chat',
          chatId,
        ]) as ChatMessageModelDTO[];

        let parent = null;
        if (parentId) {
          parent = {
            id: parentId,
            chat_id: chatId,
            content: '',
            is_edited: false,
            created_at: new Date().toISOString(),
            parent: null,
            author: null,
            loading: true,
          } satisfies OptimisticMessage as ChatMessageModelDTO;
        }
        if (editMessageId) {
          queryClient.setQueryData(
            ['chat', chatId],
            previousMessages.map(m =>
              m.id === editMessageId
                ? {
                    ...m,
                    content,
                    loading: true,
                  }
                : m,
            ),
          );
        } else {
          queryClient.setQueryData(
            ['chat', chatId],
            [
              {
                id: `${Math.random() * 1000}`,
                chat_id: chatId,
                content,
                is_edited: false,
                created_at: new Date().toISOString(),
                parent: parent,
                author: null,
                loading: true,
              } satisfies OptimisticMessage,
              ...previousMessages,
            ],
          );
        }

        return { previousMessages };
      },
      onError: (_err, _variables, context) => {
        queryClient.setQueryData(['chat', chatId], context);
      },
      onSettled: async () => {
        await ChatQuery.invalidateChat(chatId);
      },
    });
  }

  private static deleteMessageRequest = ({
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

  public static useDeleteMessageMutationOptimistic(
    message: ChatMessageModelDTO,
    isPersonalChat: boolean,
    chatId: string,
  ) {
    return useMutation({
      mutationFn: () =>
        ChatQuery.deleteMessageRequest({
          chatId: chatId,
          messageId: message.id,
          isPersonalChat: isPersonalChat,
        }),
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: ['chat', chatId],
        });

        const previousMessages = queryClient.getQueryData([
          'chat',
          chatId,
        ]) as ChatMessageModelDTO[];
        queryClient.setQueryData(
          ['chat', chatId],
          previousMessages.filter(m => m.id !== message.id),
        );

        return { previousMessages };
      },
      onError: (_err, _variables, context) => {
        queryClient.setQueryData(['chat', chatId], context);
      },
      onSettled: async () => {
        await ChatQuery.invalidateChat(chatId);
      },
    });
  }

  public static handlePresenceNewMessage = (
    payload: PresenceNewChatMessage,
  ) => {
    queryClient.setQueryData(['chat', payload.chat_id], () => {
      const old = queryClient.getQueryData([
        'chat',
        payload.chat_id,
      ]) as ChatMessageModelDTO[];
      if (!old) return [payload.content];
      return [...old, payload.content];
    });
  };

  public static handlePresenceDeletedMessage = (
    payload: PresenceDeletedChatMessage,
  ) => {
    queryClient.setQueryData(['chat', payload.chat_id], () => {
      const old = queryClient.getQueryData([
        'chat',
        payload.chat_id,
      ]) as ChatMessageModelDTO[];
      if (!old) return [];
      return old.filter(m => m.id !== payload.message_id);
    });
  };

  public static handlePresenceUpdatedMessage = (
    payload: PresenceUpdatedChatMessage,
  ) => {
    queryClient.setQueryData(['chat', payload.chat_id], () => {
      const old = queryClient.getQueryData([
        'chat',
        payload.chat_id,
      ]) as ChatMessageModelDTO[];
      if (!old) return [];
      return old.map(m =>
        m.id === payload.message_id ? { ...m, ...payload.content } : m,
      );
    });
  };

  public static invalidateChat = (id: string) => {
    return queryClient.invalidateQueries({
      queryKey: ['chat', id],
    });
  };
}
