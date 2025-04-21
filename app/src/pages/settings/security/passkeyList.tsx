import { invalidatePasskeys, usePasskeys } from '@lib/query.ts';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import PasskeyRegister from '@components/passkey/register.tsx';
import { motion } from 'framer-motion';
import { PasskeyModelDTO } from '@bindings/PasskeyModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';
import { Trash2 } from 'lucide-react';

export default function PasskeyList() {
  const notifications = useNotifications(s => s.actions);
  const passkeys = usePasskeys();

  const deleteAction = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const deleteId = notifications.notify({
        title: 'Deleting passkey',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .delete(`${BASE_URL}auth/passkey/${id}`)
        .then(() => {
          invalidatePasskeys().then();
          notifications.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(() => {
          notifications.updateNotification(deleteId, {
            severity: Severity.ERROR,
            status: 'Failed',
            timeout: 1000,
            canDismiss: true,
          });
        });
    },
  });

  return (
    <section className={'space-y-2'}>
      <div className={'flex'}>
        <SettingsSubtitle title={'Passkeys'} />
        {!!passkeys.data?.length && (
          <span
            className={
              'ml-1 animate-fade-in-left delay-200 text-sm text-stone-500 dark:text-stone-400'
            }>
            ({passkeys.data?.length})
          </span>
        )}
        <div className={'ml-auto animate-fade-in-right delay-300'}>
          <PasskeyRegister />
        </div>
      </div>
      <ul
        className={
          'rounded-md bg-popover p-2 border animate-fade-in-top delay-300'
        }>
        {!passkeys.data?.length && (
          <EmptyList noIcon message={'No passkeys added'} />
        )}
        {passkeys.data?.map((item, i) => (
          <PasskeyItem
            last={i === passkeys.data?.length - 1}
            key={item.id}
            passkey={item}
            onDelete={() => deleteAction.mutate({ id: item.id })}
          />
        ))}
      </ul>
    </section>
  );
}

function PasskeyItem({
  passkey,
  onDelete,
  last = false,
}: {
  passkey: PasskeyModelDTO;
  onDelete?: () => void;
  last?: boolean;
}) {
  return (
    <motion.li
      layout
      className={cn(
        'flex items-center justify-between gap-2 border-b-1 border-stone-300 p-2 dark:border-stone-600',
        last && 'border-transparent dark:border-transparent',
      )}>
      <span>{passkey.name}</span>
      <Trash2
        className={'h-5 w-5 cursor-pointer text-red-500'}
        onClick={onDelete}
      />
    </motion.li>
  );
}
