import { invalidateFiles, useOperations } from '@lib/query.ts';
import { OperationStatus, OperationType } from '@models/operation.ts';
import { useEffect, useRef, useState } from 'react';
import { useUserState } from '@stores/userStore.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { StaticNotificationItem } from '@components/notifications/staticNotificationItem.tsx';
import { OperationItem } from '@components/header/notifications/operationItem.tsx';
import { AttentionDot } from '@components/header/attentionDot.tsx';
import { Bell } from 'lucide-react';
import {
  Sheet,
  SheetBodyTransform,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@components/ui/sheet.tsx';

const simpleHash = (data: unknown): string => {
  return JSON.stringify(data);
};

export default function NotificationsSheet() {
  const [open, setOpen] = useState(false);
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
    const newHash = simpleHash(operations.data);

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
      if (simpleHash(ids) !== simpleHash(initialSucceeded)) {
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
  }, [operations.data, initial, initialSucceeded]);

  useEffect(() => {
    if (open) setSeen(true);
  }, [open]);

  return (
    <>
      {open && <SheetBodyTransform />}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type={'button'} className={'flex p-2.5 sm:p-3 relative'}>
            {!seen && <AttentionDot />}
            <Bell className={'h-6 w-6'} />
          </button>
        </SheetTrigger>
        <SheetContent side={'right'} className={'p-3'}>
          <SheetTitle>Notifications</SheetTitle>
          <ul
            className={
              'max-h-[calc(50vh-150px)] divide-y divide-border overflow-y-auto scrollbar-hide'
            }
          >
            {notifications.length ? (
              notifications.map((notification, i) => (
                <StaticNotificationItem
                  key={notification.id}
                  data={notification}
                  index={i}
                />
              ))
            ) : (
              <li
                className={
                  'self-center justify-self-center font-light text-muted-foreground'
                }
              >
                No notifications in the current session.
              </li>
            )}
          </ul>
          <div>
            <h2
              className={
                'mt-2 text-left text-base font-light text-stone-800 dark:text-stone-200'
              }
            >
              Operations
            </h2>
            <div
              className={
                'max-h-[calc(50vh-150px)] divide-y divide-border overflow-y-auto scrollbar-hide'
              }
            >
              {operations.data?.length ? (
                operations.data?.map((operation, i) => (
                  <OperationItem
                    key={operation.id}
                    data={operation}
                    index={i}
                  />
                ))
              ) : (
                <p
                  className={
                    'self-center justify-self-center font-light text-muted-foreground'
                  }
                >
                  No operations
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
