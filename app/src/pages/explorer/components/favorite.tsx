import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { StarIcon } from '@heroicons/react/24/outline';
import { DataOperationType } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { motion } from 'framer-motion';
import { invalidateData } from '@lib/query.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

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
        .put(`${BASE_URL}auth/${type}/favorite/${id}`)
        .then(() => {
          invalidateData(type).then(onUpdate);
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
    <motion.button
      //layoutId={`favorite-${id}`}
      className={tw('flex items-center gap-1', iconOnly ? 'p-2' : '')}
      onClick={e => {
        e.stopPropagation();
        action.mutate();
      }}>
      <StarIcon
        className={tw(
          'h-6 w-6 transition-all',
          active
            ? 'fill-amber-400 stroke-amber-400'
            : 'fill-transparent stroke-stone-400',
          white && !active ? 'fill-stone-50/60 stroke-stone-300' : '',
        )}
      />
      {!iconOnly && 'Favorite'}
    </motion.button>
  );
}
