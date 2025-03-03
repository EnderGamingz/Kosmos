import { cn } from '@lib/utils.ts';

export const NotificationCircle = ({ className }: { className: string }) => (
  <div
    className={cn('h-2.5 w-2.5 rounded-full opacity-50 shadow', className)}
  />
);
