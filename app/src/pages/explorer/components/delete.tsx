import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateFiles, invalidateFolders } from '../../../lib/query.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';
import { useState } from 'react';
import { OperationType } from '../../../../models/file.ts';

export function DeleteAction({
  type,
  id,
}: {
  type: OperationType;
  id: string;
}) {
  const [actionId, setActionId] = useState('');
  const notification = useNotifications(s => s.actions);
  const deleteAction = useMutation({
    mutationFn: () => {
      notification.notify({
        id: actionId,
        title: `Deleting ${type}`,
        loading: true,
        severity: Severity.INFO,
      });
      return axios.delete(`${BASE_URL}auth/${type}/${id}`);
    },
    onSuccess: async () => {
      notification.updateNotification(actionId, {
        severity: Severity.SUCCESS,
        status: 'Deleted successfully',
        timeout: 1000,
      });

      if (type === 'file') await invalidateFiles();
      else await invalidateFolders();
    },
    onError: err => {
      notification.updateNotification(actionId, {
        severity: Severity.ERROR,
        // @ts-ignore
        description: err.response?.data?.error || 'Error',
        timeout: 2000,
      });
    },
  });

  return (
    <button
      onClick={() => {
        setActionId(new Date().toISOString());
        deleteAction.mutate();
      }}
      disabled={deleteAction.isPending}>
      Delete
    </button>
  );
}
