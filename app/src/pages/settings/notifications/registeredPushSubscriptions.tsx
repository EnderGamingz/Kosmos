import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';
import { getError, SupportBanner } from './supportBanner';
import { FormEvent, useEffect, useState } from 'react';
import { PushQuery } from '@lib/queries/pushQuery.ts';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { BellPlus, Send, Trash } from 'lucide-react';
import { Input } from '@components/ui/input.tsx';
import useDisclosure from '@hooks/useDisclosure.ts';
import { PUSH_PUBLIC_BASE64 } from '@lib/env.ts';
import { formatDistanceToNow } from 'date-fns';

export function RegisteredPushSubscriptions() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getError().then(setError);
  }, []);

  return (
    <section className={'space-y-2'}>
      <div className={'flex'}>
        <SettingsSubtitle
          title={'Push Subscriptions'}
          description={
            'Get chat and event notifications even when the app is closed'
          }
        />
        {!error && (
          <div className={'ml-auto animate-fade-in-right delay-300'}>
            <Register />
          </div>
        )}
      </div>
      <div className={'animate-fade-in-top delay-100'}>
        <SupportBanner error={error} />
      </div>
      <FetchBoundary fetchGoal={'subscriptions'}>
        <List />
      </FetchBoundary>
    </section>
  );
}

function Register() {
  const notifications = useNotifications(s => s.actions);
  const { isOpen, onOpenChange, onClose } = useDisclosure();

  const registerMutation =
    PushQuery.useCreateSubscriptionMutation(notifications);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (!name) return;
    onClose();

    const notifyId = notifications.notify({
      title: 'Registering device',
      severity: Severity.INFO,
      loading: true,
      canDismiss: false,
    });

    const registration = await navigator.serviceWorker
      .getRegistration()
      .catch(e => {
        notifications.updateNotification(notifyId, {
          severity: Severity.ERROR,
          status: 'Error',
          description: e.message,
          canDismiss: true,
          timeout: 5000,
        });
        return null;
      });

    if (!registration) return;

    console.log('Got registration: ', registration);

    const subscription = await registration?.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUSH_PUBLIC_BASE64,
      })
      .then(sub => sub.toJSON())
      .catch(e => {
        notifications.updateNotification(notifyId, {
          severity: Severity.ERROR,
          status: 'Error',
          description: e.message,
          canDismiss: true,
          timeout: 5000,
        });
        return null;
      });

    if (!subscription) return;

    console.log('Got subscription: ', subscription);

    if (!subscription.keys || !subscription.endpoint) {
      notifications.updateNotification(notifyId, {
        severity: Severity.ERROR,
        status: 'Error',
        description: 'No keys found',
        canDismiss: true,
        timeout: 5000,
      });
      return;
    }

    console.log('All keys found in subscription, starting negotiating');

    registerMutation.mutate({
      subscription: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        name: name,
      },
      updateId: notifyId,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className={'animate-fade-in-right delay-300'}
          disabled={registerMutation.isPending}
          variant={'outline'}
          size={'sm'}>
          <BellPlus />
          Register this device
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

function List() {
  const notifications = useNotifications(s => s.actions);
  const subscriptions = PushQuery.usePushSubscriptionsSuspense();

  const deleteAction = PushQuery.useDeleteSubscriptionMutation(notifications);

  return (
    <>
      <ul
        className={
          'rounded-md bg-popover p-2 border animate-fade-in-top delay-300'
        }>
        {!subscriptions.data?.length && (
          <EmptyList noIcon message={'No subscriptions added'} />
        )}
        {subscriptions.data?.map(item => (
          <li
            key={item.id}
            className={'flex items-center gap-2 px-2 space-y-2'}>
            <div>
              <p className={'text-lg'}>{item.name}</p>
              <p className={'text-sm text-muted-foreground'}>
                Created{' '}
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Button
              variant={'ghost'}
              className={'ml-auto'}
              disabled={deleteAction.isPending}
              onClick={() => deleteAction.mutate({ id: item.id })}>
              <Trash />
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
