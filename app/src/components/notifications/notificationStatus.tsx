import { type Notification, Severity } from '@stores/notificationStore.ts';

import { cn } from '@lib/utils.ts';
import { Progress } from '@components/ui/progress.tsx';

export function NotificationStatus({
  data,
  className,
  indicatorClassName,
}: {
  data: Notification;
  className?: string;
  indicatorClassName?: string;
}) {
  const isSuccess = data.severity === Severity.SUCCESS;
  const isError = data.severity === Severity.ERROR;

  if (data.loading) {
    return (
      <Progress
        indeterminate={!isSuccess && !isError}
        value={100}
        className={cn(
          'bg-transparent absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden transition-height',
          (isSuccess || isError) && 'h-0',
          className,
        )}
        indicatorClassName={cn('bg-primary', indicatorClassName)}
        aria-label={'Loading...'}
      />
    );
  }

  return null;
}
