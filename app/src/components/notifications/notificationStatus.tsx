import { Notification, Severity } from '@stores/notificationStore.ts';

import { cn } from '@lib/utils.ts';
import { Progress } from '@components/ui/progress.tsx';

export function NotificationStatus({ data }: { data: Notification }) {
  const isSuccess = data.severity === Severity.SUCCESS;
  const isError = data.severity === Severity.ERROR;

  if (data.loading) {
    return (
      <Progress
        indeterminate={!isSuccess && !isError}
        value={100}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden transition-height',
          (isSuccess || isError) && 'h-0',
        )}
        indicatorClassName={'bg-stone-50'}
        aria-label={'Loading...'}
      />
    );
  }

  return null;
}
