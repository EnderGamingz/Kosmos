import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { startPasskeyLoginFunction } from '@components/passkey/startPasskeyLoginFunction.ts';

export default function PasskeyLogin() {
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
      await startPasskeyLoginFunction({ mediationOverwrite: 'required' })
        .then(res => {
          navigate('/home');
          setUser(res);

          notifications.removeNotification(loginId);
        })
        .catch(() =>
          notifications.updateNotification(loginId, {
            severity: Severity.ERROR,
            status: 'Failed',
            canDismiss: true,
            timeout: 1000,
          }),
        );
    },
  });

  return (
    <button
      onClick={() => loginMutation.mutate()}
      className={'btn-white w-full'}
      disabled={loginMutation.isPending}>
      <CheckBadgeIcon />
      Use Passkey
    </button>
  );
}
