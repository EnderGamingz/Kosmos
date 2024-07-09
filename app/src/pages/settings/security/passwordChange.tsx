import { FormEvent, useState } from 'react';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';

export function PasswordChange() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const notification = useNotifications(s => s.actions);

  const action = useMutation({
    mutationFn: async () => {
      const updateId = notification.notify({
        title: 'Update password',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .patch(`${BASE_URL}auth/user/password`, {
          old_password: oldPassword,
          new_password: newPassword,
        })
        .then(() => {
          setOldPassword('');
          setNewPassword('');
          notification.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            description: 'Password updated',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(e => {
          notification.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            canDismiss: true,
            timeout: 5000,
          });
        });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    action.mutate();
  };

  return (
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-bold'}>Change Password</h2>
      <form
        className={'grid grid-cols-1 gap-4 md:grid-cols-2'}
        onSubmit={handleSubmit}>
        <input
          type={'password'}
          placeholder={'Enter old password'}
          name={'old_password'}
          className={'input'}
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
        <input
          type={'password'}
          placeholder={'Enter new password'}
          name={'new_password'}
          className={'input'}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <div className={'col-span-1 md:col-span-2'}>
          <button
            type={'submit'}
            className={'btn-black ml-auto'}
            disabled={action.isPending || (!oldPassword && !newPassword)}>
            Change Password
          </button>
        </div>
      </form>
    </section>
  );
}