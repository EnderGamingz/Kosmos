import { FormEvent, ReactNode, useRef, useState } from 'react';
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

  const { mutate } = useMutation({
    mutationFn: async ({ value }: { value: string }) => {
      const createId = notifications.notify({
        title: 'Create folder',
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .post(`${BASE_URL}auth/folder${folder ? `/${folder}` : ''}`, {
          name: value,
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

  return (
    <ButtonForm
      label={'Create Folder'}
      icon={<FolderIcon />}
      onSubmit={value => mutate({ value })}
    />
  );
}

export function ButtonForm({
  label,
  icon,
  onSubmit,
  suffix,
}: {
  label: string;
  icon: ReactNode;
  suffix?: string;
  onSubmit: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  const handleActivate = () => {
    setActive(true);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    if (!value) return;
    onSubmit(value + (suffix || ''));
  };

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        variants={itemTransitionVariantFadeInFromTopSmall}
        className={'menu-button relative flex items-center py-2'}
        onClick={handleActivate}>
        <button
          disabled={!active || !value}
          type={'submit'}
          className={'no-pre [&>svg]:h-5 [&>svg]:w-5 [&>svg]:min-w-5'}>
          {active ? <CheckIcon className={'h-5 w-5'} /> : icon}
        </button>
        <div className={'relative flex'}>
          <input
            ref={inputRef}
            type={'text'}
            placeholder={'Name'}
            value={active ? value : label}
            onChange={e => setValue(e.target.value)}
            className={tw(
              'border-nones w-36 rounded-lg bg-transparent py-0.5 outline-none transition-all',
              !active && 'pointer-events-none',
            )}
          />
          {suffix && active && (
            <span
              className={
                'pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs opacity-50'
              }>
              {suffix}
            </span>
          )}
        </div>
      </motion.div>
    </form>
  );
}
