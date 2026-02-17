import { useParams } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateShareAccess } from '@lib/query.ts';
import { Input } from '@components/ui/input.tsx';
import { Button } from '@components/ui/button.tsx';
import { Check } from 'lucide-react';

export function PasswordUnlock() {
  const [value, setValue] = useState('');
  const notifications = useNotifications(s => s.actions);
  const { uuid } = useParams();

  const unlock = useMutation({
    mutationFn: async () => {
      const unlockId = notifications.notify({
        title: 'Unlock Share',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });
      await axios
        .post(`${BASE_URL}s/unlock`, {
          share_uuid: uuid,
          password: value,
        })
        .then(() => {
          invalidateShareAccess().then();
          notifications.updateNotification(unlockId, {
            canDismiss: true,
            status: 'Unlocked',
            timeout: 1000,
            severity: Severity.SUCCESS,
          });
        })
        .catch(e => {
          notifications.updateNotification(unlockId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    unlock.mutate();
  }

  if (!uuid) return null;

  return (
    <div className={'flex flex-grow flex-col items-center justify-center'}>
      <div>
        <h2 className={'text-xl font-medium animate-fade-in-top delay-300'}>
          This share is password protected.
        </h2>
        <p className={'text-sm animate-fade-in-top delay-200'}>
          Please enter the password to access it.
        </p>
        <form onSubmit={handleSubmit} className={'mt-2 flex gap-2'}>
          <div className={'w-full max-w-xs animate-fade-in-left delay-400'}>
            <Input
              autoFocus
              type={'password'}
              placeholder={'Password'}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>
          <Button
            type={'submit'}
            disabled={!value || unlock.isPending}
            className={
              'grid min-w-10 place-items-center p-2 animate-fade-in-right delay-500'
            }
          >
            <Check className={'h-5 w-5'} />
          </Button>
        </form>
      </div>
    </div>
  );
}
