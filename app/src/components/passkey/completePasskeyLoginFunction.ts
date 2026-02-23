import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';

const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
};

// biome-ignore lint/suspicious/noExplicitAny: The assertion type is complex and not easily inferred, so we use any here for simplicity.
export const completePasskeyLoginFunction = (assertion: any) =>
  axios
    .post(`${BASE_URL}auth/passkey/authentication/complete`, {
      id: assertion.id,
      rawId: uint8ArrayToBase64(new Uint8Array(assertion.rawId)),
      type: assertion.type,
      response: {
        authenticatorData: uint8ArrayToBase64(
          new Uint8Array(assertion.response.authenticatorData),
        ),
        clientDataJSON: uint8ArrayToBase64(
          new Uint8Array(assertion.response.clientDataJSON),
        ),
        signature: uint8ArrayToBase64(
          new Uint8Array(assertion.response.signature),
        ),
        userHandle: uint8ArrayToBase64(
          new Uint8Array(assertion.response.userHandle),
        ),
      },
    })
    .then(res => res.data as UserModelDTO);
