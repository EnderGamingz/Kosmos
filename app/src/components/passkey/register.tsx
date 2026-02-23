import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { invalidatePasskeys } from '@lib/query.ts';
import type { SubmitEventHandler } from 'react';
import useDisclosure from '@hooks/useDisclosure.ts';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import getPasskeyError from '@components/passkey/getPasskeyError.ts';
import { KeyRound, Send } from 'lucide-react';

const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
};

const base64ToUint8Array = (str: string): Uint8Array => {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// biome-ignore lint/suspicious/noExplicitAny: Credential type
const completeFunction = (credential: any) =>
  axios
    .post(`${BASE_URL}auth/passkey/register/complete`, {
      id: credential?.id,
      rawId: uint8ArrayToBase64(new Uint8Array(credential?.rawId)),
      type: credential?.type,
      response: {
        attestationObject: uint8ArrayToBase64(
          new Uint8Array(credential?.response.attestationObject),
        ),
        clientDataJSON: uint8ArrayToBase64(
          new Uint8Array(credential?.response.clientDataJSON),
        ),
      },
    })
    .then(res => res.data);

const startFunction = (name: string) =>
  axios
    .post(`${BASE_URL}auth/passkey/register/start`, { name })
    .then(res => res.data)
    .then(credentialCreationOptions => {
      credentialCreationOptions.publicKey.challenge = base64ToUint8Array(
        credentialCreationOptions.publicKey.challenge,
      );
      credentialCreationOptions.publicKey.user.id = base64ToUint8Array(
        credentialCreationOptions.publicKey.user.id,
      );
      credentialCreationOptions.publicKey.excludeCredentials?.forEach(
        (listItem: { id: string | Uint8Array }) => {
          if (typeof listItem.id === 'string') {
            listItem.id = base64ToUint8Array(listItem.id);
          }
        },
      );

      // Required for username-less login
      credentialCreationOptions.publicKey.authenticatorSelection.residentKey =
        'required';

      return navigator.credentials.create({
        publicKey: credentialCreationOptions.publicKey,
      });
    })
    .then(completeFunction);

export default function PasskeyRegister() {
  const notifications = useNotifications(s => s.actions);

  const registerMutation = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const registerId = notifications.notify({
        title: 'Passkey Register',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await startFunction(name)
        .then(() => {
          invalidatePasskeys().then();
          notifications.updateNotification(registerId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(e => {
          notifications.updateNotification(registerId, {
            severity: Severity.ERROR,
            status: 'Failed',
            description: getPasskeyError(e),
            canDismiss: true,
            timeout: 3000,
          });
        });
    },
  });

  const { isOpen, onOpenChange, onClose } = useDisclosure();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (!name) return;
    onClose();
    registerMutation.mutate({ name });
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={registerMutation.isPending}
          variant={'outline'}
          size={'sm'}
        >
          <KeyRound />
          Create Passkey
        </Button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'} className={'w-full p-4'}>
        <form onSubmit={handleSubmit} className={'flex gap-2'}>
          <Input
            type={'text'}
            name={'name'}
            id={'name'}
            placeholder={'Name*'}
            required
          />
          <Button type={'submit'}>
            <Send className={'h-5 w-5'} />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
