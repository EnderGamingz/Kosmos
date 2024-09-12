import tw from '@utils/classMerge.ts';
import { motion } from 'framer-motion';
import { Progress } from '@nextui-org/react';
import { getPercentageStats } from '@components/usage/getPercentage.ts';
import { DiskUsageStats } from '@bindings/DiskUsageStats.ts';

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
    <div className={tw(small ? 'h-1' : large ? 'h-5' : 'h-2')}>
      <div
        className={tw(
          'flex h-full w-full items-center gap-[4px]',
          warningLimit && '[&>.active]:bg-yellow-500',
          alertLimit && '[&>.active]:bg-red-500',
        )}>
        {loading ? (
          <Progress
            className={'h-full'}
            aria-label={'usage loading'}
            isIndeterminate
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
