import { Notification } from '@stores/notificationStore.ts';
import {
  getSeverityBorderColor,
  getSeverityIcon,
} from '@components/notifications/getSeverityIcon.tsx';
import { NotificationStatus } from '@components/notifications/notificationStatus.tsx';
import { Forward, TextQuote } from 'lucide-react';
import { cn } from '@lib/utils.ts';

export function StaticNotificationItem({
  data,
  index,
}: {
  data: Notification;
  index: number;
}) {
  const Icon = getSeverityIcon(data.severity);
  const color = getSeverityBorderColor(data.severity);

  return (
    <li
      className={cn(
        'relative w-full animate-fade-in-top rounded-r-[3px] pr-3 border-r-3 py-1',
        color,
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}>
      <div className={'flex items-center gap-1 mt-1'}>
        <Icon className={'h-4 w-4'} />
        <div className={'flex justify-between w-full'}>
          <p className={'font-medium'}>{data.title}</p>
          {data.status && (
            <span
              className={
                'flex items-center gap-1 text-xs font-light text-muted-foreground'
              }>
              <Forward className={'h-3 w-3'} />
              {data.status}
            </span>
          )}
        </div>
      </div>
      <div className={'mb-1 grid text-sm font-light'}>
        {data.description && (
          <p className={'flex items-center gap-1'}>
            <TextQuote className={'h-3 w-3'} />
            {data.description}
          </p>
        )}
      </div>
      <NotificationStatus data={data} />
    </li>
  );
}
