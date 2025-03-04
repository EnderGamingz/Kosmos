import { Notification } from '@stores/notificationStore.ts';
import { getSeverityIcon } from '@components/notifications/getSeverityIcon.tsx';
import { NotificationStatus } from '@components/notifications/notificationStatus.tsx';
import { Bars3BottomLeftIcon, ForwardIcon } from '@heroicons/react/24/outline';

export function StaticNotificationItem({
  data,
  index,
}: {
  data: Notification;
  index: number;
}) {
  return (
    <div
      className={'relative w-full animate-fade-in-top'}
      style={{
        animationDelay: `${index * 50}ms`,
      }}>
      <div className={'flex items-center'}>
        <div className={'mr-1 mt-1 flex h-5 w-5'}>
          {getSeverityIcon(data.severity)}
        </div>
        <p className={'mt-1 font-medium'}>{data.title}</p>
      </div>
      <div className={'mb-1 grid text-sm font-light'}>
        {data.description && (
          <p>
            <Bars3BottomLeftIcon className={'ml-0.5 mr-1.5 inline h-4 w-4'} />
            {data.description}
          </p>
        )}
        {data.status && (
          <span>
            <ForwardIcon className={'ml-0.5 mr-1.5 inline h-4 w-4'} />
            {data.status}
          </span>
        )}
      </div>
      <NotificationStatus data={data} />
    </div>
  );
}
