import {
  type Notification,
  useNotifications,
} from '@stores/notificationStore.ts';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { NotificationStatus } from './notificationStatus.tsx';
import {
  getSeverityBorderColor,
  getSeverityIcon,
} from '@components/notifications/getSeverityIcon.tsx';
import { Collapse } from 'react-collapse';
import { cn } from '@lib/utils.ts';
import { X } from 'lucide-react';

const ExpandedNotificationHeight = 64;

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
    ? index * ExpandedNotificationHeight + index * 2
    : index * (10 - index * 0.7);

  const exitDirection = mobile ? -30 : 30;

  const Icon = getSeverityIcon(data.severity);
  const color = getSeverityBorderColor(data.severity);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 30, rotate: '-5deg' }}
      animate={{
        opacity: 1,
        y: 0,
        bottom: !mobile ? relativePos : 'unset',
        top: mobile ? relativePos : 'unset',
        zIndex: -index,
        scale: expanded ? 1 : index === 0 ? 1 : 1 - index * 0.02,
        height: expanded ? ExpandedNotificationHeight : 'auto',
        rotate: '0deg',
      }}
      drag={'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, { offset, velocity }) => {
        if (!data.canDismiss) return;
        if (Math.abs(offset.x) / velocity.x < 0.5) {
          update(data.id, { popup: false });
        }
      }}
      exit={{ opacity: 0, y: exitDirection, zIndex: 1, rotate: '5deg' }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative w-full cursor-grab overflow-hidden transition-colors',
        'rounded-sm bg-popover border border-r-4 shadow-md',
        color,
      )}
    >
      <div className={'flex gap-1 px-2 py-2'}>
        <Icon className={'mr-1 flex size-7 shrink-0'} />
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
          <button
            type={'button'}
            onClick={e => {
              e.stopPropagation();
              update(data.id, { popup: false });
            }}
            className={
              'ml-auto self-start rounded-full p-1 transition-colors hover:bg-slate-300/50'
            }
          >
            <X className={'h-5 w-5'} />
          </button>
        )}
      </div>
      <NotificationStatus data={data} />
    </motion.li>
  );
}
