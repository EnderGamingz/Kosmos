import { Base64 } from 'js-base64';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useUserState } from '@stores/userStore.ts';
import { UserModel } from '@models/user.ts';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const completeFunction = (assertion: any) =>
  axios
    .post(BASE_URL + 'auth/passkey/authentication/complete', {
      id: assertion.id,
      rawId: Base64.fromUint8Array(new Uint8Array(assertion.rawId), true),
      type: assertion.type,
      response: {
        authenticatorData: Base64.fromUint8Array(
          new Uint8Array(assertion.response.authenticatorData),
          true,
        ),
        clientDataJSON: Base64.fromUint8Array(
          new Uint8Array(assertion.response.clientDataJSON),
          true,
        ),
        signature: Base64.fromUint8Array(
          new Uint8Array(assertion.response.signature),
          true,
        ),
        userHandle: Base64.fromUint8Array(
          new Uint8Array(assertion.response.userHandle),
          true,
        ),
      },
    })
    .then(res => res.data as UserModel);

const startFunction = () =>
  axios
    .post(BASE_URL + 'auth/passkey/authentication/start')
    .then(res => res.data)
    .then(credentialRequestOptions => {
      credentialRequestOptions.publicKey.challenge = Base64.toUint8Array(
        credentialRequestOptions.publicKey.challenge,
      );
      credentialRequestOptions.publicKey.allowCredentials?.forEach(
        (listItem: { id: string | Uint8Array }) => {
          if (typeof listItem.id === 'string') {
            listItem.id = Base64.toUint8Array(listItem.id);
          }
        },
      );
      return navigator.credentials.get({
        publicKey: credentialRequestOptions.publicKey,
      });
    })
    .then(completeFunction);

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
      await startFunction()
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
