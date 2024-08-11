import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Base64 } from 'js-base64';

import { completePasskeyLoginFunction } from '@components/passkey/completePasskeyLoginFunction.ts';

export const startPasskeyLoginFunction = ({
  onController,
  mediationOverwrite,
}: {
  onController?: (controller: AbortController) => void;
  mediationOverwrite?: CredentialMediationRequirement;
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
        mediation:
          mediationOverwrite ?? credentialRequestOptions.data.mediation,
        signal: controller.signal,
      });
    })
    .then(completePasskeyLoginFunction);

  onController?.(controller);
  return req;
};
