import useWebSocket from 'react-use-websocket';
import { BASE_URL } from '@lib/env.ts';
import { WEBSOCKET_ENDPOINT } from '@lib/constants.ts';
import { useUserState } from '@stores/userStore.ts';

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

  //TODO handle lastJsonMessage

  return null;
}
