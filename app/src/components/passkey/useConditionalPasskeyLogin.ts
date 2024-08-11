import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { startPasskeyLoginFunction } from '@components/passkey/startPasskeyLoginFunction.ts';

export function useConditionalPasskeyLogin() {
  const setUser = useUserState(s => s.setUser);
  const navigate = useNavigate();
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    window.PublicKeyCredential.isConditionalMediationAvailable().then(
      result => {
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
      },
    );
    return () => controller.current?.abort('aborting passkey due to unmount');
  }, [navigate, setUser]);
}