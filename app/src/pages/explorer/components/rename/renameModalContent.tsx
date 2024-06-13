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
import { OperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';

export function RenameModalContent({
  renameData,
  onClose,
}: {
  renameData: { id: string; type: OperationType; name: string };
  onClose: () => void;
}) {
  const [inputName, setInputName] = useState(renameData.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nameLength = useMemo(() => inputName.lastIndexOf('.'), [inputName]);

  const notify = useNotifications(s => s.actions.notify);

  const renameAction = useMutation({
    mutationFn: () =>
      axios.patch(`${BASE_URL}auth/${renameData.type}/${renameData.id}`, {
        name: inputName,
      }),
    onSuccess: async () => {
      onClose();
      await invalidateData(renameData.type);
      notify({
        title: `Rename ${renameData.type}`,
        status: 'Renaming successfully',
        severity: Severity.SUCCESS,
        timeout: 1000,
      });
    },
    onError: err => {
      notify({
        title: `Rename ${renameData.type}`,
        severity: Severity.ERROR,
        // @ts-expect-error response is expected
        description: err.response?.data?.error || 'Error',
        timeout: 2000,
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
              className={
                'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-slate-200 px-1'
              }>
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
              'overflow-ellipsis rounded-md border border-slate-400 p-2'
            }
          />
        </ModalBody>
        <ModalFooter className={'justify-between'}>
          <button
            type={'button'}
            onClick={onClose}
            className={
              'rounded-md px-3 py-1 text-slate-600 outline outline-1 outline-slate-600'
            }>
            Cancel
          </button>
          <button
            type={'submit'}
            disabled={inputName === renameData.name || renameAction.isPending}
            className={
              'rounded-md bg-indigo-300 px-3 py-1 transition-all disabled:opacity-70 disabled:grayscale'
            }>
            {renameAction.isPending ? 'Renaming' : 'Rename'}
          </button>
        </ModalFooter>
      </form>
    </>
  );
}
