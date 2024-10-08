import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { invalidateData } from '@lib/query.ts';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import tw from '@utils/classMerge.ts';

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

          invalidateData(renameData.type).then();
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
      <ModalHeader className='grid gap-1'>
        <h2 className={'flex flex-wrap gap-1 overflow-hidden'}>
          Rename {renameData.type}
          <Tooltip content={renameData.name}>
            <p
              className={tw(
                'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-stone-200 px-1',
                'dark:bg-stone-700',
              )}>
              {renameData.name}
            </p>
          </Tooltip>
        </h2>
      </ModalHeader>
      <form onSubmit={handleNameSubmit}>
        <ModalBody className={'min-h-16'}>
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
              'overflow-ellipsis rounded-md border border-stone-400 p-2'
            }
          />
        </ModalBody>
        <ModalFooter className={'justify-between'}>
          <button type={'button'} onClick={onClose} className={'btn-white'}>
            Cancel
          </button>
          <button
            type={'submit'}
            disabled={inputName === renameData.name || renameAction.isPending}
            className={'btn-black'}>
            {renameAction.isPending ? 'Renaming' : 'Rename'}
          </button>
        </ModalFooter>
      </form>
    </>
  );
}
