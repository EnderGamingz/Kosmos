import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/env.ts';
import axios from 'axios';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { FormEvent, useState } from 'react';
import useLogout from '@hooks/useLogout.ts';
import tw from '@utils/classMerge.ts';
import { useUsageStats } from '@lib/query.ts';
import { useFormatBytes } from '@utils/fileSize.ts';

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
    <div className={'space-y-3'}>
      <p>Enter your current password to delete your account</p>
      <span className={'text-sm'}>
        This action <b>cannot</b> be undone and will permanently{' '}
        <b>delete your {useFormatBytes(usage.data?.total || 0)}</b> of data.
      </span>
      <form
        onSubmit={handleSubmit}
        className={'flex flex-col gap-2 md:flex-row'}>
        <input
          className={'input'}
          placeholder={'Password'}
          type={'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className={'btn-black bg-red-700'}
          type={'submit'}
          disabled={action.isPending || !password}>
          {confirm ? 'Are you sure?' : 'Delete Account'}
        </button>
      </form>
    </div>
  );
}

export function DangerSettings() {
  return (
    <section
      className={tw(
        '!mt-12 space-y-3 rounded-xl bg-red-500/5 p-4',
        'text-red-950 outline outline-1 outline-red-700/50',
        'dark:bg-red-400/20 dark:text-red-200',
      )}>
      <h2 className={'text-xl font-bold'}>Danger Zone</h2>
      <DeleteAccount />
    </section>
  );
}
