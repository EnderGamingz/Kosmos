import {
  Notification,
  Severity,
  useNotifications,
} from '../../stores/notificationStore.ts';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import tw from '../../lib/classMerge.ts';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { NotificationStatus } from './notificationStatus.tsx';

export function NotificationItem({ data }: { data: Notification }) {
  const update = useNotifications(s => s.actions.updateNotification);

  useEffect(() => {
    const timeout =
      data.timeout &&
      setTimeout(() => {
        update(data.id, { popup: false });
      }, data.timeout);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [data.timeout]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.2 }}
      className={tw(
        'rounded-md border border-slate-500 bg-slate-100 text-slate-950 shadow-sm transition-colors',
        data.severity === Severity.SUCCESS &&
          'border-green-500 bg-green-100 text-green-950',
        data.severity === Severity.ERROR &&
          'border-red-500 bg-red-100 text-red-950',
        data.severity === Severity.WARN &&
          'border-amber-500 bg-amber-100 text-amber-950',
      )}>
      <div className={'flex items-center justify-between px-3 py-1'}>
        <div>
          <p className={'font-semibold'}>{data.title}</p>
          <div className={'text-xs font-light'}>
            {data.description && (
              <p className={'inline'}>
                {data.description}
                {data.status && <> &bull; </>}
              </p>
            )}
            {data.status && <p className={'inline'}>{data.status}</p>}
          </div>
        </div>
        <div
          onClick={() => update(data.id, { popup: false })}
          className={
            'cursor-pointer rounded-full p-1 transition-colors hover:bg-slate-300/50'
          }>
          <XMarkIcon className={'h-5 w-5 text-slate-600'} />
        </div>
      </div>
      <NotificationStatus data={data} />
    </motion.div>
  );
}
