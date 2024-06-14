import { refetchOperations, useOperations } from '@lib/query.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import {
  CircularProgress,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Tooltip,
} from '@nextui-org/react';
import { BellIcon } from '@heroicons/react/24/outline';
import {
  getOperationStatusString,
  getOperationTypeString,
  OperationModel,
  OperationStatus,
} from '@models/operation.ts';
import { UpdatingTimeIndicator } from '@components/updatingTimeIndicator.tsx';
import tw from '@lib/classMerge.ts';

export function OperationsMenu() {
  const operations = useOperations();

  return (
    <Popover placement={'bottom'} showArrow={true}>
      <PopoverTrigger>
        <button>
          <BellIcon className={'h-6 w-6'} />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <>
          <h2 className={'mt-2 text-left text-base font-light text-stone-800'}>
            Background operations
          </h2>
          <ScrollShadow
            className={
              'grid max-h-[300px] w-full gap-2 divide-y divide-stone-200 overflow-y-auto px-1 py-3 scrollbar-hide'
            }>
            {operations.data?.map(operation => (
              <OperationItem key={operation.id} data={operation} />
            ))}
          </ScrollShadow>
        </>
      </PopoverContent>
    </Popover>
  );
}

function OperationItem({ data }: { data: OperationModel }) {
  const retry = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}auth/file/image/retry/operation/${data.id}`),
    onSuccess: () => {
      setTimeout(() => {
        refetchOperations().then();
      }, 2_000);
    },
  });

  const hasEnded = !!data.ended_at;
  const canRetry =
    data.operation_status === OperationStatus.Failed ||
    data.operation_status === OperationStatus.Interrupted;

  return (
    <div className={''}>
      <div className={'flex items-center justify-between gap-4'}>
        <p className={'text-base font-medium text-stone-800'}>
          {getOperationTypeString(data.operation_type)}
        </p>
        <Tooltip content={getOperationStatusString(data.operation_status)}>
          <span>
            <OperationStatusIndicator status={data.operation_status} />
          </span>
        </Tooltip>
      </div>
      <div className={'flex justify-between'}>
        <p className={'text-xs text-stone-500'}>
          {hasEnded ? 'Ended ' : 'Started '}
          <UpdatingTimeIndicator
            time={(hasEnded ? data.ended_at : data.started_at) || 0}
          />
        </p>
        {canRetry && !retry.isSuccess && (
          <button
            disabled={retry.isPending}
            className={'text-xs text-stone-800 underline'}
            onClick={() => {
              retry.mutate();
            }}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

const NotificationCircle = ({ className }: { className: string }) => (
  <div
    className={tw('h-2.5 w-2.5 rounded-full opacity-50 shadow', className)}
  />
);

function OperationStatusIndicator({ status }: { status: OperationStatus }) {
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
