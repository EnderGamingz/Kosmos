import { invalidateShares } from '@lib/query.ts';
import type { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext, useState } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { DisplayContext } from '@lib/contexts.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Shredder } from 'lucide-react';

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

          // Handled by presence
          // invalidateData(deleteData.type).then();
          // invalidateUsage().then();
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
      className={
        'text-red-500 hover:!text-red-800 dark:text-red-300 dark:hover:!text-red-300'
      }
    >
      <Shredder />
      {short ? 'Delete' : 'Delete Permanently'}
    </button>
  );
}

export function MultiPermanentDelete({
  deleteData,
  onClose,
}: {
  deleteData: { folders: FolderModelDTO[]; files: FileModelDTO[] };
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
            folders: deleteData.folders.map(folder => folder.id),
            files: deleteData.files.map(file => file.id),
          },
        })
        .then(async () => {
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Deleted',
            timeout: 1000,
            canDismiss: true,
          });

          // Handled by presence
          //if (deleteData.files.length) invalidateFiles().then();
          //if (deleteData.folders.length) invalidateFolders().then();
          invalidateShares().then();

          //invalidateUsage().then();
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
      className={cn(
        !confirmed && !shift
          ? 'text-gray-400 hover:!text-gray-400'
          : 'bg-red-400 !text-white hover:!bg-red-500',
      )}
    >
      <Shredder />
      Delete {deleteType}
    </button>
  );
}
