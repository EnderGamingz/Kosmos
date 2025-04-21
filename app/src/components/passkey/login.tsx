import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { startPasskeyLoginFunction } from '@components/passkey/startPasskeyLoginFunction.ts';
import { Button } from '../ui/button';
import { RefObject } from 'react';
import getPasskeyError from '@components/passkey/getPasskeyError.ts';
import { BadgeCheck } from 'lucide-react';

export default function PasskeyLogin({
  conditionalAbortController,
  onFail,
}: {
  conditionalAbortController: RefObject<AbortController | null>;
  onFail: () => void;
}) {
  const notifications = useNotifications(s => s.actions);
  const setUser = useUserState(s => s.setUser);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const loginId = notifications.notify({
        title: 'Passkey Login',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      conditionalAbortController.current?.abort(
        'aborting conditional passkey login and starting new one',
      );
      await startPasskeyLoginFunction({ mediationOverwrite: 'required' })
        .then(res => {
          navigate('/home');
          setUser(res);

          notifications.removeNotification(loginId);
        })
        .catch(e => {
          notifications.updateNotification(loginId, {
            severity: Severity.ERROR,
            status: 'Failed',
            description: getPasskeyError(e),
            canDismiss: true,
            timeout: 1000,
          });
          onFail();
        });
    },
  });

  return (
    <Button
      type={'button'}
      variant={'outline'}
      onClick={() => loginMutation.mutate()}
      className={'w-full cursor-pointer'}
      disabled={loginMutation.isPending}>
      <BadgeCheck />
      Use Passkey
    </Button>
  );
}
