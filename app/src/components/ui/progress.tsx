import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

type ComponentProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indeterminate?: boolean;
  indicatorClassName?: string;
};

export function Progress({
  className,
  value,
  indeterminate,
  indicatorClassName,
  ...props
}: ComponentProps) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn(
          'bg-primary h-full w-full flex-1 transition-all',
          indicatorClassName,
          indeterminate && 'animate-progress origin-left',
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
