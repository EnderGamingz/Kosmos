import { invalidatePasskeys, usePasskeys } from '@lib/query.ts';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { TrashIcon } from '@heroicons/react/24/outline';
import PasskeyRegister from '@components/passkey/register.tsx';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { PasskeyModelDTO } from '@bindings/PasskeyModelDTO.ts';

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
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-bold'}>
        Added Passkeys{' '}
        {!!passkeys.data?.length && (
          <span
            className={
              'ml-1 text-sm font-normal text-stone-500 dark:text-stone-400'
            }>
            ({passkeys.data?.length})
          </span>
        )}
      </h2>
      <motion.ul
        className={
          'max-w-md rounded-xl bg-stone-200/50 p-2 dark:bg-stone-700/50'
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
        <motion.li layout className={'flex justify-center pt-3'}>
          <PasskeyRegister />
        </motion.li>
      </motion.ul>
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
      className={tw(
        'flex items-center justify-between gap-2 border-b-1 border-stone-300 p-2 dark:border-stone-600',
        last && 'border-transparent dark:border-transparent',
      )}>
      <span>{passkey.name}</span>
      <TrashIcon
        className={'h-5 w-5 cursor-pointer text-red-500'}
        onClick={onDelete}
      />
    </motion.li>
  );
}
