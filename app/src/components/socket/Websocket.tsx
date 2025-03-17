import useWebSocket from 'react-use-websocket';
import { BASE_URL } from '@lib/env.ts';
import { WEBSOCKET_ENDPOINT } from '@lib/constants.ts';
import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { PresenceMessage } from '@bindings/PresenceMessage.ts';
import { ChatQuery } from '@lib/queries/chatQuery.ts';
import { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';
import { PresenceDeletedChatMessage } from '@bindings/PresenceDeletedChatMessage';
import { PresenceUpdatedChatMessage } from '@bindings/PresenceUpdatedChatMessage';
import { PresenceSocialUpdate } from '@bindings/PresenceSocialUpdate';
import { PresenceOperationsUpdate } from '@bindings/PresenceOperationsUpdate.ts';

export default function Websocket() {
  const user = useUserState(s => s.user);

  if (!user) return null;

  return <Connector />;
}

function Connector() {
  const { lastJsonMessage } = useWebSocket(BASE_URL + WEBSOCKET_ENDPOINT, {
    onOpen: () => console.log('[Presence] Connection established'),
    onClose: () => console.log('[Presence] Connection closed'),
    onError: e => console.error('[Presence] Error', e),
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage) handleServerAction(lastJsonMessage as PresenceMessage);
  }, [lastJsonMessage]);

  //TODO handle lastJsonMessage

  return null;
}

function handleServerAction(data: PresenceMessage) {
  const action = data?.action;
  if (!action) return;

  if ('NewChatMessage' in action) {
    const newChatMessage = action.NewChatMessage as PresenceNewChatMessage;

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
    const socialUpdate = action.SocialUpdate as PresenceSocialUpdate;

    //TODO handle socialUpdate
    return;
  }

  if ('OperationsUpdate' in action) {
    const operationsUpdate =
      action.OperationsUpdate as PresenceOperationsUpdate;

    //TODO handle operationsUpdate
  }
}
