import { useUserState } from '@stores/userStore.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import objectHash from 'object-hash';
import { Input } from '@components/ui/input.tsx';
import { Button } from '@components/ui/button.tsx';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';
import { api } from '@lib/queries/api.ts';

export function UserInformation() {
  const user = useUserState(s => s.user);
  const updateUser = useUserState(s => s.setUser);
  const notifications = useNotifications(s => s.actions);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.full_name || '');

  const action = useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Update user',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await api
        .patch(`auth/user`, {
          username: username,
          email: email ?? undefined,
          full_name: fullName ?? undefined,
        })
        .then(res => {
          updateUser(res.data);
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Updated',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(e => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
            canDismiss: true,
          });
        });
    },
  });

  if (!user) return null;

  return (
    <section className={'space-y-3'}>
      <SettingsSubtitle title={'User information'} />
      <form
        onSubmit={e => {
          e.preventDefault();
          action.mutate();
        }}
        className={
          'grid grid-cols-1 gap-2 sm:grid-cols-2 [&>div]:space-y-1 [&_label]:block animate-fade-in-top delay-100'
        }>
        <div>
          <label htmlFor={'username'}>Username</label>
          <Input
            required
            id={'username'}
            value={username}
            placeholder={'Username'}
            minLength={3}
            maxLength={255}
            onChange={e => setUsername(e.target.value.trim())}
          />
        </div>
        <div>
          <label htmlFor={'email'}>Email</label>
          <Input
            id={'email'}
            value={email}
            placeholder={'Email'}
            onChange={e => setEmail(e.target.value.trim())}
          />
        </div>
        <div>
          <label htmlFor={'full_name'}>Full Name</label>
          <Input
            id={'full_name'}
            value={fullName}
            placeholder={'Full Name'}
            onChange={e => setFullName(e.target.value)}
          />
        </div>
        <div
          className={
            'col-span-1 mt-1 md:col-span-2 animate-fade-in-top delay-200'
          }>
          <Button
            type={'submit'}
            disabled={
              action.isPending ||
              objectHash(user) ===
                objectHash({ ...user, username, email, full_name: fullName })
            }
            className={'float-right px-5'}>
            Update
          </Button>
        </div>
      </form>
    </section>
  );
}
