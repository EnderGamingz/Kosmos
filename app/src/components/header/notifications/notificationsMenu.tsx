import { invalidateFiles, useOperations } from '@lib/query.ts';
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@nextui-org/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { OperationStatus, OperationType } from '@models/operation.ts';
import tw from '@utils/classMerge.ts';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/defaults/transition.ts';
import objectHash from 'object-hash';
import { useUserState } from '@stores/userStore.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { StaticNotificationItem } from '@components/notifications/staticNotificationItem.tsx';
import { OperationItem } from '@components/header/notifications/operationItem.tsx';

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
      onOpenChange={open => {
        if (open) setSeen(true);
      }}>
      <PopoverTrigger>
        <button className={'flex p-2'}>
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
      <PopoverContent className={'bg-transparent py-0 shadow-none'}>
        <div
          className={tw(
            'flex min-w-[220px] flex-col gap-2',
            '[&>div]:bg-stone-50 [&>div]:px-2 [&>div]:shadow-large [&>div]:dark:bg-stone-800',
            '[&>div]:rounded-lg',
          )}>
          <div>
            <h2
              className={
                'mt-2 text-left text-base font-light text-stone-800 dark:text-stone-200'
              }>
              Notifications
            </h2>
            <ScrollShadow
              as={motion.div}
              variants={containerVariant()}
              initial={'hidden'}
              animate={'show'}
              className={tw(
                'h-full max-h-[150px] max-w-56 md:max-h-[250px]',
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
                    'self-center justify-self-center font-light text-stone-400 dark:text-stone-500'
                  }>
                  No notifications
                </p>
              )}
            </ScrollShadow>
          </div>
          <div>
            <h2
              className={
                'mt-2 text-left text-base font-light text-stone-800 dark:text-stone-200'
              }>
              Operations
            </h2>
            <ScrollShadow
              as={motion.div}
              variants={containerVariant()}
              initial={'hidden'}
              animate={'show'}
              className={tw(
                'max-h-[150px] md:max-h-[250px]',
                'grid w-full gap-2 divide-y divide-stone-200 overflow-y-auto px-1 pb-3 pt-1 scrollbar-hide',
              )}>
              {operations.data?.length ? (
                operations.data?.map(operation => (
                  <OperationItem key={operation.id} data={operation} />
                ))
              ) : (
                <p
                  className={
                    'self-center justify-self-center font-light text-stone-400 dark:text-stone-500'
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
