import { Notification, Severity } from '@stores/notificationStore.ts';
import { Progress } from '@nextui-org/react';
import tw from '@lib/classMerge.ts';

export function NotificationStatus({ data }: { data: Notification }) {
  const isSuccess = data.severity === Severity.SUCCESS;
  const isError = data.severity === Severity.ERROR;

  if (data.loading) {
    return (
      <Progress
        isIndeterminate={!isSuccess && !isError}
        value={100}
        className={tw(
          'absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden transition-height',
          (isSuccess || isError) && 'h-0',
        )}
        aria-label={'Loading...'}
      />
    );
  }

  return null;
}
