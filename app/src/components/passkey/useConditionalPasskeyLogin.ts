import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { type RefObject, useEffect, useState } from 'react';
import { startPasskeyLoginFunction } from '@components/passkey/startPasskeyLoginFunction.ts';

export function useConditionalPasskeyLogin(
  controller: RefObject<AbortController | null>,
) {
  const [restart, setRestart] = useState(0);
  const setUser = useUserState(s => s.setUser);
  const navigate = useNavigate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount and when restart changes, not when controller changes
  useEffect(() => {
    if (
      typeof PublicKeyCredential.isConditionalMediationAvailable !== 'function'
    )
      return;

    PublicKeyCredential.isConditionalMediationAvailable().then(result => {
      if (result) {
        if (controller.current !== null) {
          controller.current.abort(
            'aborting ongoing passkey login and starting new one',
          );
        }
        startPasskeyLoginFunction({
          onController: (abortController: AbortController) => {
            controller.current = abortController;
          },
        }).then(res => {
          setUser(res);
          navigate('/home');
        });
      }
    });
    return () => controller.current?.abort('aborting passkey due to unmount');
  }, [navigate, setUser, restart]);

  return () => setRestart(prev => (prev === 0 ? 1 : 0));
}
