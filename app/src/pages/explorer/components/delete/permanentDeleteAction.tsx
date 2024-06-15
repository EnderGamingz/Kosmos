import {
  invalidateData,
  invalidateFiles,
  invalidateFolders,
  invalidateUsage,
} from '@lib/query.ts';
import { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import { useState } from 'react';
import tw from '@lib/classMerge.ts';
import { useExplorerStore } from '@stores/folderStore.ts';

export function PermanentDeleteAction({
  deleteData,
  onClose,
}: {
  deleteData: { id: string; type: DataOperationType; name: string };
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
    <button
      onClick={() => {
        onClose();
        deleteAction.mutate();
      }}
      type={'button'}
      className={'text-red-500 hover:!text-red-800'}>
      <TrashIcon />
      Delete Permanently
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
  const shift = useKeyStore(s => s.shift);
  const notification = useNotifications(s => s.actions);
  const setSelectedNone = useExplorerStore(s => s.selectedResources.selectNone);
  const deleteType = deleteData.folders.length ? 'Recursively' : 'Permanently';
  const [confirmed, setConfirmed] = useState(false);

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: `${deleteType} deleting data`,
        loading: true,
        severity: Severity.INFO,
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
            status: 'Deleted successfully',
            timeout: 1000,
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
            timeout: 2000,
          });
        });
    },
  });

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
