import useWebSocket from 'react-use-websocket';
import { BASE_URL } from '@lib/env.ts';
import { JWT_TOKEN_STORAGE_KEY, WEBSOCKET_ENDPOINT } from '@lib/constants.ts';
import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { PresenceMessage } from '@bindings/PresenceMessage.ts';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';
import { PresenceDeletedChatMessage } from '@bindings/PresenceDeletedChatMessage';
import { PresenceUpdatedChatMessage } from '@bindings/PresenceUpdatedChatMessage';
import { PresenceSocialUpdate } from '@bindings/PresenceSocialUpdate';
import { PresenceOperationsUpdate } from '@bindings/PresenceOperationsUpdate.ts';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import {
  handlePresenceOperationsUpdate,
  invalidateFiles,
  invalidateFolder,
  invalidateUsage,
} from '@lib/query.ts';
import {
  SocialUpdateState,
  useSocialUpdate,
} from '@stores/socialUpdateStore.ts';
import { PresenceChatUpdate } from '@bindings/PresenceChatUpdate';

export default function Websocket() {
  const user = useUserState(s => s.user);

  if (!user) return null;

  return <Connector />;
}

function Connector() {
  const socialUpdate = useSocialUpdate();

  const jwtToken = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
  if (!jwtToken) return null;

  const { lastJsonMessage } = useWebSocket(
    `${BASE_URL + WEBSOCKET_ENDPOINT}?token=${jwtToken}`,
    {
      onOpen: () => console.log('[Presence] Connection established'),
      onClose: () => console.log('[Presence] Connection closed'),
      onError: e => console.error('[Presence] Error', e),
      shouldReconnect: () => true,
    },
  );

  useEffect(() => {
    if (lastJsonMessage)
      handleServerAction(lastJsonMessage as PresenceMessage, socialUpdate);
  }, [lastJsonMessage]);

  return null;
}

function handleServerAction(
  data: PresenceMessage,
  socialUpdate: SocialUpdateState,
) {
  const action = data?.action;
  if (!action) return;

  if ('NewChatMessage' in action) {
    const newChatMessage = action.NewChatMessage as PresenceNewChatMessage;

    socialUpdate.setChatMessage(newChatMessage);
    ChatQuery.handlePresenceNewMessage(newChatMessage);
    return;
  }

  if ('DeletedChatMessage' in action) {
    const deletedChatMessage =
      action.DeletedChatMessage as PresenceDeletedChatMessage;

    ChatQuery.handlePresenceDeletedMessage(deletedChatMessage);
    return;
  }

  if ('UpdatedChatMessage' in action) {
    const updatedChatMessage =
      action.UpdatedChatMessage as PresenceUpdatedChatMessage;

    ChatQuery.handlePresenceUpdatedMessage(updatedChatMessage);
    return;
  }

  if ('SocialUpdate' in action) {
    const data = action.SocialUpdate as PresenceSocialUpdate;

    ContactQuery.handlePresenceSocialUpdate(data);
    return;
  }

  if ('OperationsUpdate' in action) {
    const operationsUpdate =
      action.OperationsUpdate as PresenceOperationsUpdate;

    handlePresenceOperationsUpdate(operationsUpdate);
  }

  if ('ExplorerUpdate' in action) {
    //const explorerUpdate = action.ExplorerUpdate as PresenceExplorerUpdate;
    invalidateFiles().then();
    invalidateFolder().then();
    invalidateUsage().then();
  }

  if ('ChatUpdate' in action) {
    const chatUpdate = action.ChatUpdate as PresenceChatUpdate;
    ChatQuery.invalidateChatInfo(chatUpdate.chat_id).then();
  }

  if ('ChatsUpdate' in action) {
    ChatQuery.invalidateChats().then();
  }
}
