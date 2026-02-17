import { Input } from '@components/ui/input.tsx';
import { Button } from '@components/ui/button.tsx';
import { useUserState } from '@stores/userStore.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import type { UpdateProfileDTO } from '@bindings/UpdateProfileDTO.ts';
import { ProfileQuery } from '@lib/queries/profileQuery.ts';
import { Textarea } from '@components/ui/textarea.tsx';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';

export default function ProfileInfoSettings() {
  const user = useUserState(s => s.user);
  const notifications = useNotifications(s => s.actions);

  if (!user) return null;

  const { data } = ProfileQuery.useProfileSelfSuspense();

  const action = useMutation({
    mutationFn: async ({ payload }: { payload: UpdateProfileDTO }) => {
      const updateId = notifications.notify({
        title: 'Update Profile',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .patch(`${BASE_URL}auth/profile`, payload)
        .then(() => {
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload: UpdateProfileDTO = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone_number: formData.get('phone_number') as string,
      bio: formData.get('bio') as string,
      website: formData.get('website') as string,
      location: formData.get('location') as string,
    };

    action.mutate({ payload });
  };

  return (
    <section className={'space-y-3'}>
      <SettingsSubtitle title={'Public information'} className={'delay-300'} />
      <form
        onSubmit={onSubmit}
        className={
          'grid grid-cols-1 gap-2 sm:grid-cols-2 [&>div]:space-y-1 [&_label]:block animate-fade-in-top delay-300'
        }
      >
        <div>
          <label htmlFor={'full_name'}>Full Name</label>
          <Input
            id={'full_name'}
            name={'full_name'}
            type={'text'}
            placeholder={'John Doe'}
            defaultValue={data.full_name ?? ''}
          />
        </div>
        <div>
          <label htmlFor={'email'}>Email</label>
          <Input
            id={'email'}
            name={'email'}
            type={'email'}
            placeholder={'email@example.com'}
            defaultValue={data.email ?? ''}
          />
        </div>
        <div>
          <label htmlFor={'phone_number'}>Phone Number</label>
          <Input
            id={'phone_number'}
            name={'phone_number'}
            type={'tel'}
            placeholder={'+12 34567890'}
            defaultValue={data.phone_number ?? ''}
          />
        </div>
        <div className={'sm:row-span-2 sm:col-span-2 flex flex-col'}>
          <label htmlFor={'bio'}>Bio</label>
          <Textarea
            id={'bio'}
            name={'bio'}
            placeholder={'Write something about yourself'}
            defaultValue={data.bio ?? ''}
            className={'resize-none h-32'}
          />
        </div>
        <div>
          <label htmlFor={'website'}>Website</label>
          <Input
            id={'website'}
            name={'website'}
            type={'url'}
            placeholder={'https://example.com'}
            defaultValue={data.website ?? ''}
          />
        </div>
        <div>
          <label htmlFor={'location'}>Location</label>
          <Input
            id={'location'}
            name={'location'}
            type={'text'}
            placeholder={'City, Country'}
            defaultValue={data.location ?? ''}
          />
        </div>

        <div
          className={
            'mt-auto sm:col-span-2 justify-self-end animate-fade-in-top delay-400'
          }
        >
          <Button
            type={'submit'}
            disabled={action.isPending}
            className={'px-10'}
          >
            Update
          </Button>
        </div>
      </form>
    </section>
  );
}
