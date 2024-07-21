import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateShareAccess } from '@lib/query.ts';
import { motion } from 'framer-motion';

export function PasswordUnlock() {
  const [value, setValue] = useState('');
  const notifications = useNotifications(s => s.actions);
  const { uuid } = useParams();

  const unlock = useMutation({
    mutationFn: async () => {
      const unlockId = notifications.notify({
        title: 'Unlock Share',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });
      await axios
        .post(BASE_URL + 's/unlock', {
          share_uuid: uuid,
          password: value,
        })
        .then(() => {
          invalidateShareAccess().then();
          notifications.updateNotification(unlockId, {
            canDismiss: true,
            status: 'Unlocked',
            timeout: 1000,
            severity: Severity.SUCCESS,
          });
        })
        .catch(e => {
          notifications.updateNotification(unlockId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    unlock.mutate();
  }

  if (!uuid) return null;

  return (
    <div className={'flex flex-grow flex-col items-center justify-center'}>
      <div className={'text-stone-700'}>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={'text-xl font-medium'}>
          This share is password protected.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={'text-sm'}>
          Please enter the password to access it.
        </motion.p>
        <form onSubmit={handleSubmit} className={'mt-2 flex gap-2'}>
          <motion.input
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            autoFocus
            type={'password'}
            placeholder={'Password'}
            value={value}
            onChange={e => setValue(e.target.value)}
            className={'input-bordered input w-full max-w-xs'}
          />
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            type={'submit'}
            disabled={!value || unlock.isPending}
            className={
              'btn-black grid min-w-10 place-items-center p-2 text-stone-50'
            }>
            <CheckIcon className={'h-5 w-5'} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
