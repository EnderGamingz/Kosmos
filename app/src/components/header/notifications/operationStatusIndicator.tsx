import { OperationStatus } from '@models/operation.ts';
import { CircularProgress } from '@nextui-org/react';
import { NotificationCircle } from '@components/header/notifications/notificationCircle.tsx';

export function OperationStatusIndicator({
  status,
}: {
  status: OperationStatus;
}) {
  const statusMapping = {
    [OperationStatus.Pending]: (
      <CircularProgress
        aria-label={'Operation pending'}
        classNames={{
          svg: 'h-3 w-3',
        }}
      />
    ),
    [OperationStatus.Success]: (
      <NotificationCircle className={'bg-green-500 shadow-green-500'} />
    ),
    [OperationStatus.Failed]: (
      <NotificationCircle className={'bg-red-500 shadow-red-500'} />
    ),
    [OperationStatus.Interrupted]: (
      <NotificationCircle className={'bg-gray-600 shadow-gray-600'} />
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
