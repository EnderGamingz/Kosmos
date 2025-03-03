import {
  CreateNotificationPayload,
  Severity,
} from '@stores/notificationStore.ts';
import { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';

export function Copy({
  notify,
  text,
  chip = true,
  children,
}: {
  notify: (data: CreateNotificationPayload) => void;
  text: string;
  chip?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          notify({
            title: 'Copy',
            description: 'Share link copied',
            status: 'Success',
            severity: Severity.SUCCESS,
            canDismiss: true,
            timeout: 1000,
          });
        })
      }
      className={cn(
        chip
          ? 'rounded-full bg-stone-500/20 px-2 py-0.5 text-xs transition-colors hover:bg-stone-500/50 dark:bg-stone-300/30'
          : 'btn-white',
      )}>
      {children || 'Copy Link'}
    </button>
  );
}
