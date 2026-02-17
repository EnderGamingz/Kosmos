import {
  type CreateNotificationPayload,
  Severity,
} from '@stores/notificationStore.ts';
import type { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';
import { buttonVariants } from '@components/ui/button.tsx';

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
      type={'button'}
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
          : cn(
              buttonVariants({
                variant: 'outline',
              }),
              'border-primary bg-transparent',
            ),
      )}
    >
      {children || 'Copy Link'}
    </button>
  );
}
