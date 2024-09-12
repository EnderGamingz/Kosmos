import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Base64 } from 'js-base64';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';

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
    .then(res => res.data as UserModelDTO);
