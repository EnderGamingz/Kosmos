import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { MoveData } from '@pages/explorer/components/move/moveModalContent.tsx';
import { invalidateData } from '@lib/query.ts';

export function useMove(
  moveData: MoveData,
  selectedFolder?: string,
  onClose?: () => void,
) {
  const notifications = useNotifications(s => s.actions);

  return useMutation({
    mutationFn: async () => {
      const moveId = notifications.notify({
        title: `Move ${moveData.type}`,
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .put(
          `${BASE_URL}auth/${moveData.type}/move/${moveData.id}`,
          undefined,
          {
            params: {
              folder_id: selectedFolder,
            },
          },
        )
        .then(() => {
          notifications.updateNotification(moveId, {
            severity: Severity.SUCCESS,
            status: 'Moved',
            timeout: 1000,
          });

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
