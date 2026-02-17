import useWebSocket from 'react-use-websocket';
import { BASE_URL } from '@lib/env.ts';
import { WEBSOCKET_ENDPOINT } from '@lib/constants.ts';
import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import type { PresenceMessage } from '@bindings/PresenceMessage.ts';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import type { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';
import type { PresenceDeletedChatMessage } from '@bindings/PresenceDeletedChatMessage';
import type { PresenceUpdatedChatMessage } from '@bindings/PresenceUpdatedChatMessage';
import type { PresenceSocialUpdate } from '@bindings/PresenceSocialUpdate';
import type { PresenceOperationsUpdate } from '@bindings/PresenceOperationsUpdate.ts';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import {
  handlePresenceOperationsUpdate,
  invalidateFiles,
  invalidateFolder,
  invalidateUsage,
} from '@lib/query.ts';
import {
  type SocialUpdateState,
  useSocialUpdate,
} from '@stores/socialUpdateStore.ts';
import type { PresenceChatUpdate } from '@bindings/PresenceChatUpdate';

export default function Websocket() {
  const user = useUserState(s => s.user);

  if (!user) return null;

  return <Connector />;
}

function Connector() {
  const socialUpdate = useSocialUpdate();
  const { lastJsonMessage } = useWebSocket(BASE_URL + WEBSOCKET_ENDPOINT, {
    onOpen: () => console.log('[Presence] Connection established'),
    onClose: () => console.log('[Presence] Connection closed'),
    onError: e => console.error('[Presence] Error', e),
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage)
      handleServerAction(lastJsonMessage as PresenceMessage, socialUpdate);
  }, [lastJsonMessage, socialUpdate]);

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
