import { Base64 } from 'js-base64';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { UserModel } from '@models/user.ts';
import { useEffect, useRef } from 'react';
import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const completePasskeyLoginFunction = (assertion: any) =>
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

export const startPasskeyLoginFunction = ({
  onController,
}: {
  onController: (controller: AbortController) => void;
}) => {
  const controller = new AbortController();
  const req = axios
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
        ...credentialRequestOptions,
        signal: controller.signal,
      });
    })
    .then(completePasskeyLoginFunction);

  onController(controller);
  return req;
};

export default function usePasskeyLogin() {
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
