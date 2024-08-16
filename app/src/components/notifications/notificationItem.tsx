import { Notification, useNotifications } from '@stores/notificationStore.ts';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { NotificationStatus } from './notificationStatus.tsx';
import { getSeverityIcon } from '@components/notifications/getSeverityIcon.tsx';
import { Collapse } from 'react-collapse';

const ExpandedNotificationHeight = 56;

export function NotificationItem({
  data,
  index,
  expanded,
  mobile,
}: {
  data: Notification;
  index: number;
  expanded: boolean;
  mobile: boolean;
}) {
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
  }, [data.id, data.timeout, update]);

  const relativePos = expanded
    ? index * ExpandedNotificationHeight
    : index * (10 - index * 0.7);

  const exitDirection = mobile ? -30 : 30;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        bottom: !mobile ? relativePos : 'unset',
        top: mobile ? relativePos : 'unset',
        zIndex: -index,
        scale: expanded ? 1 : index === 0 ? 1 : 1 - index * 0.02,
      }}
      drag={'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, { offset, velocity }) => {
        if (!data.canDismiss) return;
        if (Math.abs(offset.x) / velocity.x < 0.5) {
          update(data.id, { popup: false });
        }
      }}
      exit={{ opacity: 0, y: exitDirection, zIndex: 1, skew: '-10deg' }}
      transition={{ duration: 0.2 }}
      className={tw(
        'relative w-full cursor-grab overflow-hidden shadow-sm transition-colors',
        'rounded-md bg-stone-700 text-stone-50 shadow-[0_0_5px_-2px_#000000A0]',
        index === 0 || expanded ? 'text-stone-50' : 'text-stone-50/20',
      )}>
      <div className={'flex gap-1 px-2 py-2'}>
        <div className={'mr-1 flex h-7 w-7'}>
          {getSeverityIcon(data.severity)}
        </div>
        <div className={'w-full'}>
          <div className={'flex items-center'}>
            <p className={'text-lg font-medium'}>{data.title}</p>
            {data.status && (
              <span className={'ml-2 inline text-xs font-light'}>
                {data.status}
              </span>
            )}
          </div>
          <p className={'text-sm font-light'}>{data.description}</p>
          {data.child && (
            <Collapse isOpened={!data.loading}>{data.child}</Collapse>
          )}
        </div>
        {data.canDismiss && (
          <div
            onClick={e => {
              e.stopPropagation();
              update(data.id, { popup: false });
            }}
            className={
              'ml-auto cursor-pointer self-start rounded-full p-1 transition-colors hover:bg-slate-300/50'
            }>
            <XMarkIcon className={'h-5 w-5'} />
          </div>
        )}
      </div>
      <NotificationStatus data={data} />
    </motion.li>
  );
}
