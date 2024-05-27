import { FormEvent, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFolders } from '../../../lib/query.ts';
import { CheckIcon, FolderIcon } from '@heroicons/react/24/outline';
import tw from '../../../lib/classMerge.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';

export default function CreateFolder({
  folder,
  onClose,
}: {
  folder?: string;
  onClose: () => void;
}) {
  const notify = useNotifications(s => s.actions.notify);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');

  const { mutate } = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}auth/folder${folder ? `/${folder}` : ''}`, {
        name,
      }),
    onSuccess: async () => {
      await invalidateFolders();
      onClose();
      notify({
        title: 'Create folder',
        severity: Severity.SUCCESS,
        status: 'Created successfully',
        timeout: 1000,
      });
    },
    onError: err => {
      notify({
        title: `Create folder`,
        severity: Severity.ERROR,
        // @ts-expect-error response will include data
        description: err.response?.data?.error || 'Error',
        timeout: 2000,
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
      <div className={'btn-black relative py-2'} onClick={handleActivate}>
        <FolderIcon />
        <div className={'flex'}>
          <input
            ref={inputRef}
            type={'text'}
            placeholder={'Folder name'}
            value={active ? name : 'Create Folder'}
            onChange={e => setName(e.target.value)}
            className={tw(
              'border-nones rounded-lg bg-transparent py-0.5 outline-none transition-all',
              !active && 'pointer-events-none',
            )}
          />
          <button
            disabled={!active}
            className={tw(
              'transition-opacity',
              active ? 'opacity-100' : 'opacity-0',
            )}>
            <CheckIcon className={'h-4 w-4'} />
          </button>
        </div>
      </div>
    </form>
  );
}
