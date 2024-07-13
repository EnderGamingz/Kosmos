import { Progress } from '@nextui-org/react';
import tw from '@lib/classMerge.ts';

export function UsageIndicator({
  usedPercent,
  loading,
  small,
}: {
  usedPercent: number;
  loading?: boolean;
  small?: boolean;
}) {
  return (
    <Progress
      aria-label={'Usage percent'}
      className={tw(small ? 'h-1' : 'h-2')}
      color={
        usedPercent > 100 ? 'danger' : usedPercent > 90 ? 'warning' : 'default'
      }
      isIndeterminate={loading}
      value={usedPercent}
    />
  );
}
