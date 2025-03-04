import { invalidateFiles, useOperations } from '@lib/query.ts';
import { BellIcon } from '@heroicons/react/24/outline';
import { OperationStatus, OperationType } from '@models/operation.ts';
import { useEffect, useRef, useState } from 'react';
import objectHash from 'object-hash';
import { useUserState } from '@stores/userStore.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { StaticNotificationItem } from '@components/notifications/staticNotificationItem.tsx';
import { OperationItem } from '@components/header/notifications/operationItem.tsx';
import { cn } from '@lib/utils.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';

export function NotificationsMenu() {
  const [seen, setSeen] = useState(true);
  const [initial, setInitial] = useState(true);
  const [initialSucceeded, setInitialSucceeded] = useState<string[]>([]);
  const operationsHash = useRef<string>('');
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
    <Popover onOpenChange={b => b && setSeen(true)}>
      <PopoverTrigger asChild>
        <button className={'flex p-2 relative cursor-pointer'}>
          {!seen && (
            <div
              className={
                'absolute w-2 h-2 rounded-full bg-blue-400 animate-pulse top-1 right-1'
              }
            />
          )}
          <BellIcon className={'h-6 w-6'} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={'bottom'}
        className={cn(
          'bg-transparent p-0 shadow-none border-none min-w-[220px]',
          'flex flex-col gap-2',
          '[&>div]:bg-popover [&>div]:border [&>div]:px-2 [&>div]:shadow-large [&>div]:rounded-lg',
        )}>
        <div>
          <h2
            className={
              'mt-2 text-left text-base font-light text-stone-800 dark:text-stone-200'
            }>
            Notifications
          </h2>
          <div
            className={cn(
              'h-full max-h-[150px] md:max-h-[250px]',
              'flex w-full flex-col divide-y divide-border overflow-y-auto px-1 pb-3 pt-1 scrollbar-hide',
            )}>
            {notifications.length ? (
              notifications.map((notification, i) => (
                <StaticNotificationItem
                  key={notification.id}
                  data={notification}
                  index={i}
                />
              ))
            ) : (
              <p
                className={
                  'self-center justify-self-center font-light text-muted-foreground'
                }>
                No notifications
              </p>
            )}
          </div>
        </div>
        <div>
          <h2
            className={
              'mt-2 text-left text-base font-light text-stone-800 dark:text-stone-200'
            }>
            Operations
          </h2>
          <div
            className={cn(
              'max-h-[150px] md:max-h-[250px]',
              'grid w-full divide-y divide-border overflow-y-auto px-1 pb-3 pt-1 scrollbar-hide',
            )}>
            {operations.data?.length ? (
              operations.data?.map((operation, i) => (
                <OperationItem key={operation.id} data={operation} index={i} />
              ))
            ) : (
              <p
                className={
                  'self-center justify-self-center font-light text-muted-foreground'
                }>
                No operations
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
