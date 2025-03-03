import { motion } from 'framer-motion';
import { getPercentageStats } from '@components/usage/getPercentage.ts';
import { DiskUsageStats } from '@bindings/DiskUsageStats.ts';
import { cn } from '@lib/utils.ts';
import { Progress } from '@components/ui/progress.tsx';

function ActiveBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={
        'active h-full rounded-full bg-indigo-400 transition-width dark:bg-indigo-600'
      }
      style={{ width: percent + '%' }}
    />
  );
}

function BinBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={
        'bin h-full rounded-full bg-amber-500 transition-width dark:bg-amber-600'
      }
      style={{ width: percent + '%' }}
    />
  );
}

export function AvailableBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={
        'remaining h-full rounded-full bg-stone-700/20 transition-width dark:bg-stone-500'
      }
      style={{ width: percent + '%' }}
    />
  );
}

export function UsageIndicator({
  data,
  loading,
  small,
  large,
}: {
  data?: DiskUsageStats;
  loading?: boolean;
  small?: boolean;
  large?: boolean;
}) {
  const {
    percentageActive,
    percentageBin,
    remainingPercentage,
    alertLimit,
    warningLimit,
  } = getPercentageStats(data);

  return (
    <div className={cn(small ? 'h-1' : large ? 'h-5' : 'h-2')}>
      <div
        className={cn(
          'flex h-full w-full items-center gap-[2px]',
          warningLimit && '[&>.active]:bg-yellow-500',
          alertLimit && '[&>.active]:bg-red-500',
        )}>
        {loading ? (
          <Progress
            className={'h-full'}
            aria-label={'usage loading'}
            indeterminate
          />
        ) : (
          <>
            <ActiveBar percent={percentageActive} />
            <BinBar percent={percentageBin} />
            <AvailableBar percent={remainingPercentage} />
          </>
        )}
      </div>
    </div>
  );
}
