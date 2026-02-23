import { OperationStatus } from '@models/operation.ts';
import { NotificationCircle } from '@components/header/notifications/notificationCircle.tsx';
import { LoaderCircle } from 'lucide-react';

export function OperationStatusIndicator({
  status,
}: {
  status: OperationStatus;
}) {
  const statusMapping = {
    [OperationStatus.Pending]: (
      <LoaderCircle
        aria-label={'Operation pending'}
        className={'animate-spin w-3 h-3'}
      />
    ),
    [OperationStatus.Success]: (
      <NotificationCircle className={'bg-green-500 shadow-green-500'} />
    ),
    [OperationStatus.Failed]: (
      <NotificationCircle className={'bg-red-500 shadow-red-500'} />
    ),
    [OperationStatus.Interrupted]: (
      <NotificationCircle className={'bg-gray-600 shadow-gray-600 dark:bg-gray-400 dark:shadow-gray-400'} />
    ),
    [OperationStatus.Unrecoverable]: (
      <NotificationCircle className={'bg-red-800 shadow-red-800'} />
    ),
    [OperationStatus.Recovered]: (
      <NotificationCircle className={'bg-green-800 shadow-green-800'} />
    ),
  };

  return statusMapping[status] || <span></span>;
}
