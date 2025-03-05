import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/env.ts';
import axios from 'axios';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { FormEvent, useState } from 'react';
import useLogout from '@hooks/useLogout.ts';
import { useUsageStats } from '@lib/query.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import { cn } from '@lib/utils.ts';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';

function DeleteAccount() {
  const usage = useUsageStats();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const notifications = useNotifications(s => s.actions);
  const logout = useLogout();

  const action = useMutation({
    mutationFn: async () => {
      const deleteId = notifications.notify({
        title: 'Delete Account',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });

      await axios
        .delete(`${BASE_URL}auth/user`, {
          data: { password },
        })
        .then(() => {
          notifications.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });
          logout();
        })
        .catch(e => {
          notifications.updateNotification(deleteId, {
            severity: Severity.ERROR,
            status: 'Failed',
            description: e.response?.data?.error || 'Error',
            canDismiss: true,
          });
          setPassword('');
        });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!confirm) {
      setConfirm(true);
      return;
    }
    action.mutate();
  };

  return (
    <div className={'space-y-2'}>
      <p>Enter your current password to delete your account</p>
      <span className={'text-sm'}>
        This action <strong>cannot</strong> be undone and will permanently{' '}
        <strong>delete your {useFormatBytes(usage.data?.total || 0)}</strong> of
        data.
      </span>
      <form
        onSubmit={handleSubmit}
        className={'flex flex-col gap-2 sm:flex-row mt-4'}>
        <Input
          placeholder={'Password'}
          type={'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button
          variant={'destructive'}
          type={'submit'}
          className={'h-11'}
          disabled={action.isPending || !password}>
          {confirm ? 'Are you sure?' : 'Delete Account'}
        </Button>
      </form>
    </div>
  );
}

export function DangerSettings() {
  return (
    <section
      className={cn(
        '!mt-12 space-y-2 rounded-xl  p-4',
        'text-red-950 border-2 border-red-700/50',
        'dark:text-red-50',
      )}>
      <h2 className={'text-xl font-bold'}>Danger Zone</h2>
      <DeleteAccount />
    </section>
  );
}
