import {
  invalidateData,
  invalidateFiles,
  invalidateFolders,
  invalidateUsage,
} from '@lib/query.ts';
import { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext, useState } from 'react';
import tw from '@utils/classMerge.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { DisplayContext } from '@lib/contexts.ts';

export function PermanentDeleteAction({
  deleteData,
  onClose,
  short,
}: {
  deleteData: { id: string; type: DataOperationType; name: string };
  onClose?: () => void;
  short?: boolean;
}) {
  const notification = useNotifications(s => s.actions);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `Deleting ${deleteData.type}`,
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });

      await axios
        .delete(`${BASE_URL}auth/${deleteData.type}/${deleteData.id}`)
        .then(async () => {
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });

          invalidateData(deleteData.type).then();
          invalidateUsage().then();
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: err.response?.data?.error || 'Error',
            canDismiss: true,
          });
        });
    },
  });

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <button
      onClick={() => {
        onClose?.();
        deleteAction.mutate();
      }}
      type={'button'}
      className={'text-red-500 hover:!text-red-800'}>
      <TrashIcon />
      {short ? 'Delete' : 'Delete Permanently'}
    </button>
  );
}

export function MultiPermanentDelete({
  deleteData,
  onClose,
}: {
  deleteData: { folders: string[]; files: string[] };
  onClose: () => void;
}) {
  const shift = useKeyStore(s => s.keys.shift);
  const notification = useNotifications(s => s.actions);
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);
  const deleteType = deleteData.folders.length ? 'Recursively' : 'Permanently';
  const [confirmed, setConfirmed] = useState(false);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `Deleting data`,
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });

      await axios
        .delete(`${BASE_URL}auth/multi`, {
          data: {
            folders: deleteData.folders,
            files: deleteData.files,
          },
        })
        .then(async () => {
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });

          if (deleteData.files.length) invalidateFiles().then();
          if (deleteData.folders.length) invalidateFolders().then();

          invalidateUsage().then();
          setSelectedNone();
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            description: err.response?.data?.error || 'Error',
            canDismiss: true,
          });
        });
    },
  });

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  const handleDelete = () => {
    if (!confirmed && !shift) {
      setConfirmed(true);
    } else {
      onClose();
      deleteAction.mutate();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteAction.isPending}
      type={'button'}
      className={tw(
        !confirmed && !shift
          ? 'text-gray-400 hover:!text-gray-400'
          : 'bg-red-400 !text-white hover:!bg-red-500',
      )}>
      <TrashIcon />
      Delete {deleteType}
    </button>
  );
}
