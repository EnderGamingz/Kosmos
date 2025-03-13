import { Base64 } from 'js-base64';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { invalidatePasskeys } from '@lib/query.ts';
import { FormEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useUserState } from '@stores/userStore.ts';
import useDisclosure from '@hooks/useDisclosure.ts';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import getPasskeyError from '@components/passkey/getPasskeyError.ts';
import { KeyRound } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const completeFunction = (credential: any) =>
  axios
    .post(`${BASE_URL}auth/passkey/register/complete`, {
      id: credential?.id,
      rawId: Base64.fromUint8Array(new Uint8Array(credential?.rawId), true),
      type: credential?.type,
      response: {
        attestationObject: Base64.fromUint8Array(
          new Uint8Array(credential?.response.attestationObject),
          true,
        ),
        clientDataJSON: Base64.fromUint8Array(
          new Uint8Array(credential?.response.clientDataJSON),
          true,
        ),
      },
    })
    .then(res => res.data);

const startFunction = (name: string) =>
  axios
    .post(`${BASE_URL}auth/passkey/register/start`, { name })
    .then(res => res.data)
    .then(credentialCreationOptions => {
      credentialCreationOptions.publicKey.challenge = Base64.toUint8Array(
        credentialCreationOptions.publicKey.challenge,
      );
      credentialCreationOptions.publicKey.user.id = Base64.toUint8Array(
        credentialCreationOptions.publicKey.user.id,
      );
      credentialCreationOptions.publicKey.excludeCredentials?.forEach(
        function (listItem: { id: string | Uint8Array }) {
          if (typeof listItem.id === 'string') {
            listItem.id = Base64.toUint8Array(listItem.id);
          }
        },
      );

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (!name) return;
    onClose();
    registerMutation.mutate({ name });
  };
  const user = useUserState(s => s.user);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={registerMutation.isPending}
          variant={'outline'}
          size={'sm'}>
          <KeyRound />
          Create Passkey
        </Button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'} className={'w-full p-4'}>
        <form onSubmit={handleSubmit} className={'flex gap-2'}>
          <input
            type={'text'}
            value={user?.username}
            readOnly
            disabled
            name={'username'}
            id={'username'}
            placeholder={'Username*'}
            autoComplete={'username'}
            className={'hidden'}
          />
          <Input
            type={'text'}
            name={'name'}
            id={'name'}
            placeholder={'Name*'}
            required
          />
          <Button type={'submit'}>
            <PaperAirplaneIcon className={'h-5 w-5'} />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
