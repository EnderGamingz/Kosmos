import { useUserState } from '@stores/userStore.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import tw from '@lib/classMerge.ts';
import objectHash from 'object-hash';

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
      await axios
        .patch(`${BASE_URL}auth/user`, {
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
      <h2 className={'text-xl font-bold'}>User Information</h2>
      <form
        className={tw(
          'grid grid-cols-1 gap-2 md:grid-cols-2',
          '[&_input]:input [&_input]:w-full',
          '[&_label]:p-1 [&_label]:text-sm [&_label]:font-medium [&_label]:text-stone-800',
        )}>
        <div>
          <label htmlFor={'username'}>Username</label>
          <input
            required
            id={'username'}
            value={username}
            placeholder={'Username'}
            min={1}
            max={255}
            onChange={e => setUsername(e.target.value.trim())}
          />
        </div>
        <div>
          <label htmlFor={'email'}>Email</label>
          <input
            id={'email'}
            value={email}
            placeholder={'Email'}
            onChange={e => setEmail(e.target.value.trim())}
          />
        </div>
        <div>
          <label htmlFor={'full_name'}>Full Name</label>
          <input
            id={'full_name'}
            value={fullName}
            placeholder={'Full Name'}
            onChange={e => setFullName(e.target.value)}
          />
        </div>
        <div className={'col-span-1 mt-1 md:col-span-2'}>
          <button
            disabled={
              action.isPending ||
              objectHash(user) ===
                objectHash({ ...user, username, email, full_name: fullName })
            }
            className={'btn-black ml-auto px-5'}
            onClick={e => {
              e.preventDefault();
              action.mutate();
            }}>
            Update
          </button>
        </div>
      </form>
    </section>
  );
}
