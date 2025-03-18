import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';

import { cn } from '@lib/utils.ts';
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Button } from '@components/ui/button.tsx';

export function RenameModalContent({
  renameData,
  onClose,
}: {
  renameData: { id: string; type: DataOperationType; name: string };
  onClose: () => void;
}) {
  const [inputName, setInputName] = useState(renameData.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nameLength = useMemo(() => inputName.lastIndexOf('.'), [inputName]);

  const notifications = useNotifications(s => s.actions);

  const renameAction = useMutation({
    mutationFn: async () => {
      const renameId = notifications.notify({
        title: `Rename ${renameData.type}`,
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .patch(`${BASE_URL}auth/${renameData.type}/${renameData.id}`, {
          name: inputName,
        })
        .then(() => {
          notifications.updateNotification(renameId, {
            severity: Severity.SUCCESS,
            status: 'Renamed',
            timeout: 1000,
          });
          // Handled by presence
          //invalidateData(renameData.type).then();
          onClose();
        })
        .catch(e => {
          notifications.updateNotification(renameId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value);
  };

  const handleNameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (renameAction.isPending) return;
    renameAction.mutate();
  };

  const handleFocus = () => {
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(0, nameLength);
  };

  useEffect(() => {
    handleFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DialogHeader className='grid gap-1'>
        <DialogTitle className={'flex flex-wrap gap-1 overflow-hidden'}>
          Rename {renameData.type}
          <span
            title={renameData.name}
            className={cn(
              'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-stone-200 px-1',
              'dark:bg-stone-700',
            )}>
            {renameData.name}
          </span>
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleNameSubmit}>
        <div className={'min-h-16'}>
          <input
            ref={inputRef}
            required
            min={3}
            max={250}
            type={'text'}
            value={inputName}
            onChange={handleChange}
            onFocus={handleFocus}
            className={
              'overflow-ellipsis rounded-md border border-stone-400 p-2 w-full'
            }
          />
        </div>
        <DialogFooter className={'justify-between'}>
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button
            type={'submit'}
            disabled={inputName === renameData.name || renameAction.isPending}>
            {renameAction.isPending ? 'Renaming' : 'Rename'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
