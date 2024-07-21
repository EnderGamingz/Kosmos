import {
  invalidateFiles,
  refetchOperations,
  useOperations,
} from '@lib/query.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import {
  Badge,
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
  OperationType,
} from '@models/operation.ts';
import { UpdatingTimeIndicator } from '@components/updatingTimeIndicator.tsx';
import tw from '@utils/classMerge.ts';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/defaults/transition.ts';
import objectHash from 'object-hash';
import { useUserState } from '@stores/userStore.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { StaticNotificationItem } from '@components/notifications/staticNotificationItem.tsx';

export function NotificationsMenu() {
  const [seen, setSeen] = useState(true);
  const [initial, setInitial] = useState(true);
  const [initialSucceeded, setInitialSucceeded] = useState<string[]>([]);
  const operationsHash = useRef<string>();
  const logout = useUserState(s => s.logout);

  const operations = useOperations(logout);
  const notifications = useNotifications(s => s.notifications);

  useEffect(() => {
    if (!operations.data?.length) return;

    // Generate a hash based on the operations-data,
    // this is used for checking if the data has changed
    const newHash = objectHash(operations.data);

    if (initial) {
      // Save the initial state upon the first run
      operationsHash.current = newHash;
      setInitialSucceeded(
        operations.data
          .filter(o => o.operation_status === OperationStatus.Success)
          .map(o => o.id),
      );
      setInitial(false);
      return;
    }

    // Check if the operations-data hash has changed
    if (operationsHash.current !== newHash) {
      setSeen(false);
      operationsHash.current = newHash;

      // New set of successful operations
      const newSucceeded = operations.data.filter(
        o => o.operation_status === OperationStatus.Success,
      );

      const ids = newSucceeded.map(o => o.id);

      // If the set of succeeded operations has changed
      if (objectHash(ids) !== objectHash(initialSucceeded)) {
        const types = newSucceeded
          .filter(o => initialSucceeded.includes(o.id))
          .map(o => o.operation_type);

        // Invalidate files if any new operation is of type ImageProcessing
        if (types.includes(OperationType.ImageProcessing)) {
          invalidateFiles().then();
        }
      }

      setInitialSucceeded(ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations.data]);

  return (
    <Popover
      placement={'bottom'}
      onOpenChange={b => {
        if (b) setSeen(true);
      }}>
      <PopoverTrigger>
        <button className={'flex'}>
          <Badge
            content={''}
            color={'danger'}
            isDot
            showOutline={false}
            className={'h-2 min-h-2 w-2 min-w-2'}
            isInvisible={seen}
            placement={'top-right'}>
            <BellIcon className={'h-6 w-6'} />
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div
          className={tw(
            'min-w-[200px]',
            'flex flex-col gap-2',
            'grid-cols-2 md:grid',
          )}>
          <div>
            <h2
              className={'mt-2 text-left text-base font-light text-stone-800'}>
              Notifications
            </h2>
            <ScrollShadow
              as={motion.div}
              variants={containerVariant()}
              initial={'hidden'}
              animate={'show'}
              className={tw(
                'h-full max-h-[150px] max-w-56 md:max-h-[300px]',
                'flex w-full flex-col gap-1 divide-y divide-stone-200 overflow-y-auto px-1 pb-3 pt-1 scrollbar-hide',
              )}>
              {notifications.length ? (
                notifications.map(notification => (
                  <StaticNotificationItem
                    key={notification.id}
                    data={notification}
                  />
                ))
              ) : (
                <p
                  className={
                    'self-center justify-self-center font-light text-stone-400'
                  }>
                  No notifications
                </p>
              )}
            </ScrollShadow>
          </div>
          <div>
            <h2
              className={'mt-2 text-left text-base font-light text-stone-800'}>
              Operations
            </h2>
            <ScrollShadow
              as={motion.div}
              variants={containerVariant()}
              initial={'hidden'}
              animate={'show'}
              className={tw(
                'max-h-[150px] md:max-h-[300px]',
                'grid w-full gap-2 divide-y divide-stone-200 overflow-y-auto px-1 pb-3 pt-1 scrollbar-hide',
              )}>
              {operations.data?.length ? (
                operations.data?.map(operation => (
                  <OperationItem key={operation.id} data={operation} />
                ))
              ) : (
                <p
                  className={
                    'self-center justify-self-center font-light text-stone-400'
                  }>
                  No operations
                </p>
              )}
            </ScrollShadow>
          </div>
        </div>
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
    <motion.div variants={itemTransitionVariant}>
      <div className={'flex items-center justify-between gap-5'}>
        <p className={'text-base font-medium text-stone-800'}>
          {getOperationTypeString(data.operation_type)}
        </p>
        <Tooltip content={getOperationStatusString(data.operation_status)}>
          <span>
            <OperationStatusIndicator status={data.operation_status} />
          </span>
        </Tooltip>
      </div>
      <div className={'flex justify-between gap-3'}>
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
    </motion.div>
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
