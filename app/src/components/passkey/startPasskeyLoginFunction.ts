import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';

import { completePasskeyLoginFunction } from '@components/passkey/completePasskeyLoginFunction.ts';

const base64ToUint8Array = (str: string): Uint8Array => {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const startPasskeyLoginFunction = ({
  onController,
  mediationOverwrite,
}: {
  onController?: (controller: AbortController) => void;
  mediationOverwrite?: CredentialMediationRequirement;
}) => {
  const controller = new AbortController();
  const req = axios
    .post(`${BASE_URL}auth/passkey/authentication/start`)
    .then(res => res.data)
    .then(credentialRequestOptions => {
      credentialRequestOptions.publicKey.challenge = base64ToUint8Array(
        credentialRequestOptions.publicKey.challenge,
      );

      credentialRequestOptions.publicKey.allowCredentials?.forEach(
        (listItem: { id: string | Uint8Array }) => {
          if (typeof listItem.id === 'string') {
            listItem.id = base64ToUint8Array(listItem.id);
          }
        },
      );

      return navigator.credentials.get({
        ...credentialRequestOptions,
        mediation: mediationOverwrite ?? credentialRequestOptions.mediation,
        signal: controller.signal,
      });
    })
    .then(completePasskeyLoginFunction);

  onController?.(controller);
  return req;
};
