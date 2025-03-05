import { Input } from '@components/ui/input.tsx';
import { Button } from '@components/ui/button.tsx';
import objectHash from 'object-hash';
import { useUserState } from '@stores/userStore.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { UpdateProfilePayload } from '@pages/settings/profile/types.ts';
import { FormEvent } from 'react';

export default function ProfileInfoSettings() {
  const user = useUserState(s => s.user);
  const notifications = useNotifications(s => s.actions);

  const action = useMutation({
    mutationFn: async ({ payload }: { payload: UpdateProfilePayload }) => {
      const updateId = notifications.notify({
        title: 'Update Profile',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      /*await axios
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
        });*/
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload: UpdateProfilePayload = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
    };
    action.mutate({ payload });
  };

  // TODO Update form and fetch current profile data
  return (
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-bold'}>User Information</h2>
      <form
        onSubmit={onSubmit}
        className={
          'grid grid-cols-1 gap-2 sm:grid-cols-2 [&>div]:space-y-1 [&_label]:block'
        }>
        <div>
          <label htmlFor={'username'}>Username</label>
          <Input
            required
            id={'username'}
            placeholder={'Username'}
            minLength={3}
            maxLength={255}
          />
        </div>
        <div>
          <label htmlFor={'email'}>Email</label>
          <Input id={'email'} placeholder={'Email'} />
        </div>
        <div>
          <label htmlFor={'full_name'}>Full Name</label>
          <Input id={'full_name'} placeholder={'Full Name'} />
        </div>
        <div className={'col-span-1 mt-1 md:col-span-2'}>
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
