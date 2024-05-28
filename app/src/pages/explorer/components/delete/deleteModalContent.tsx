import { invalidateData, invalidateUsage } from '../../../../lib/query.ts';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import { OperationType } from '../../../../../models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../../vars.ts';
import {
  Severity,
  useNotifications,
} from '../../../../stores/notificationStore.ts';

export function DeleteModalContent({
  deleteData,
  onClose,
}: {
  deleteData: { id: string; type: OperationType; name: string };
  onClose: () => void;
}) {
  const notification = useNotifications(s => s.actions);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `Deleting ${deleteData.type}`,
        loading: true,
        severity: Severity.INFO,
      });

      await axios
        .delete(`${BASE_URL}auth/${deleteData.type}/${deleteData.id}`)
        .then(async () => {
          onClose();
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted successfully',
            timeout: 1000,
          });

          invalidateData(deleteData.type).then();
          invalidateUsage().then();
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            description: err.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  return (
    <>
      <ModalHeader className='grid gap-1'>
        <h2 className={'flex flex-wrap gap-1 overflow-hidden'}>
          Delete {deleteData.type}
        </h2>
      </ModalHeader>
      <ModalBody className={'min-h-16'}>
        <Tooltip content={deleteData.name}>
          <p
            className={
              'overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-slate-200 p-1'
            }>
            {deleteData.name}
          </p>
        </Tooltip>
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
          disabled={deleteAction.isPending}
          onClick={() => deleteAction.mutate()}
          className={
            'rounded-md bg-red-300 px-3 py-1 transition-all disabled:opacity-70 disabled:grayscale'
          }>
          {deleteAction.isPending ? 'Deleting' : 'Delete'}
        </button>
      </ModalFooter>
    </>
  );
}
