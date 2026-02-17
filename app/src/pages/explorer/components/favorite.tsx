import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import type { DataOperationType } from '@models/file.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import {
  invalidateData,
  invalidateFavorites,
  invalidateUsageReport,
} from '@lib/query.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { cn } from '@lib/utils.ts';
import { Star } from 'lucide-react';

export default function Favorite({
  id,
  type,
  iconOnly,
  active,
  white,
  onUpdate,
}: {
  id: string;
  type: DataOperationType;
  iconOnly?: boolean;
  active: boolean;
  white?: boolean;
  onUpdate?: () => void;
}) {
  const notifications = useNotifications(s => s.actions);

  const action = useMutation({
    mutationFn: async () => {
      if (action.isPending) return;
      await axios
        .put(`${BASE_URL}auth/favorite/${type}/${id}`)
        .then(() => {
          invalidateData(type).then(onUpdate);
          invalidateUsageReport().then();
          invalidateFavorites().then();
        })
        .catch(err => {
          notifications.notify({
            title: 'Favorite',
            canDismiss: true,
            status: 'Error',
            description: err.response?.data?.error || 'Error',
            severity: Severity.ERROR,
          });
        });
    },
  });

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <button
      type={'button'}
      className={cn(
        'flex items-center gap-1',
        iconOnly && 'p-2',
        action.isPending && 'animate-pulse cursor-wait',
      )}
      onClick={e => {
        e.stopPropagation();
        action.mutate();
      }}
    >
      <Star
        className={cn(
          'h-6 w-6 transition-all',
          active
            ? 'fill-amber-400 stroke-amber-600'
            : 'fill-transparent stroke-primary/80',
          white && !active && 'fill-border',
        )}
      />
      {!iconOnly && 'Favorite'}
    </button>
  );
}
