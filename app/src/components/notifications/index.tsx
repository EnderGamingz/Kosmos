import {
  Notification,
  Severity,
  useNotifications,
} from '../../stores/notificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@nextui-org/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';
import tw from '../../lib/classMerge.ts';

export default function NotificationIndicator() {
  const notifications = useNotifications(s =>
    s.notifications.filter(x => x.popup),
  );

  return (
    <div
      className={
        'fixed left-10 z-[100] w-full max-w-[20rem] max-sm:left-5 max-sm:top-5 sm:bottom-10'
      }>
      <ul
        className={
          'flex max-h-64 flex-col-reverse gap-2 overflow-hidden max-sm:flex-col'
        }>
        <AnimatePresence>
          {notifications.slice(0, 5).map(notification => (
            <NotificationItem key={notification.id} data={notification} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function NotificationStatus({ data }: { data: Notification }) {
  const isSuccess = data.severity === Severity.SUCCESS;
  const isError = data.severity === Severity.ERROR;
  if (data.loading) {
    return (
      <Progress
        isIndeterminate={!isSuccess && !isError}
        value={100}
        className={'h-0.5'}
        classNames={{
          indicator: isSuccess ? 'bg-green-600' : isError ? 'bg-red-600' : '',
        }}
        aria-label={'Loading...'}
      />
    );
  }
  return null;
}

function NotificationItem({ data }: { data: Notification }) {
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
        'rounded-md border border-slate-500 bg-slate-100 shadow-sm transition-colors',
        data.severity === Severity.SUCCESS && 'border-green-500 bg-green-100',
        data.severity === Severity.ERROR && 'border-red-500 bg-red-100',
      )}>
      <div className={'flex items-center justify-between px-3 py-1'}>
        <div>
          <p>{data.title}</p>
          <div className={'text-xs text-slate-600'}>
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
