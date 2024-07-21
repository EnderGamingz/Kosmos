import { FormEvent, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFolders } from '@lib/query.ts';
import { CheckIcon, FolderIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { itemTransitionVariantFadeInFromTopSmall } from '@components/defaults/transition.ts';
import { motion } from 'framer-motion';

export function CreateFolder({
  folder,
  onClose,
}: {
  folder?: string;
  onClose: () => void;
}) {
  const notifications = useNotifications(s => s.actions);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');

  const { mutate } = useMutation({
    mutationFn: async () => {
      const createId = notifications.notify({
        title: 'Create folder',
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .post(`${BASE_URL}auth/folder${folder ? `/${folder}` : ''}`, {
          name,
        })
        .then(() => {
          notifications.updateNotification(createId, {
            severity: Severity.SUCCESS,
            status: 'Created',
            timeout: 1000,
          });

          invalidateFolders().then();
          onClose();
        })
        .catch(e => {
          notifications.updateNotification(createId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate();
  };

  const handleActivate = () => {
    setActive(true);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        variants={itemTransitionVariantFadeInFromTopSmall}
        className={'btn-black relative flex items-center py-2'}
        onClick={handleActivate}>
        <button disabled={!active || !name} type={'submit'}>
          {active ? (
            <CheckIcon className={'h-5 w-5'} />
          ) : (
            <FolderIcon className={'h-5 w-5 min-w-5'} />
          )}
        </button>
        <div className={'flex'}>
          <input
            ref={inputRef}
            type={'text'}
            placeholder={'Folder name'}
            value={active ? name : 'Create Folder'}
            onChange={e => setName(e.target.value)}
            className={tw(
              'border-nones w-36 rounded-lg bg-transparent py-0.5 outline-none transition-all',
              !active && 'pointer-events-none',
            )}
          />
        </div>
      </motion.div>
    </form>
  );
}
