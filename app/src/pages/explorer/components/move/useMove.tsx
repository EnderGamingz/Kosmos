import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import {
  MoveData,
  MultiMoveData,
} from '@pages/explorer/components/move/moveModalContent.tsx';
import { invalidateData } from '@lib/query.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';

export function useMove(
  moveData: MoveData,
  multiData?: MultiMoveData,
  selectedFolder?: string,
  onClose?: () => void,
) {
  const notifications = useNotifications(s => s.actions);
  const unselect = useExplorerStore(s => s.selectedResources.unselect);

  function getMoveFn() {
    if (multiData) {
      return axios.put(`${BASE_URL}auth/multi`, {
        files: multiData.files,
        folders: multiData.folders,
        target_folder: selectedFolder?.trim() || undefined,
      });
    } else {
      return axios.put(
        `${BASE_URL}auth/${moveData.type}/move/${moveData.id}`,
        undefined,
        {
          params: {
            folder_id: selectedFolder,
          },
        },
      );
    }
  }

  return useMutation({
    mutationFn: async () => {
      const moveId = notifications.notify({
        title: `Move ${moveData.type}`,
        severity: Severity.INFO,
        loading: true,
      });
      await getMoveFn()
        .then(() => {
          notifications.updateNotification(moveId, {
            severity: Severity.SUCCESS,
            status: 'Moved',
            timeout: 1000,
          });

          const itemsMoved = [
            ...(multiData?.files || []),
            ...(multiData?.folders || []),
          ];
          if (moveData.id) itemsMoved.push(moveData.id);

          unselect(itemsMoved);
          invalidateData(moveData.type).then();
          onClose?.();
        })
        .catch(e => {
          notifications.updateNotification(moveId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });
}
