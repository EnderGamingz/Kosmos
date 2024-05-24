import { Notification, Severity } from '../../stores/notificationStore.ts';
import { Progress } from '@nextui-org/react';

export function NotificationStatus({ data }: { data: Notification }) {
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
