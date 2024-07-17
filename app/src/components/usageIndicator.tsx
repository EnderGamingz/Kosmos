import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { Progress } from '@nextui-org/react';
import { UsageStats } from '@models/usage.ts';
import { getPercentageStats } from '@components/getPercentage.ts';

function ActiveBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={'active h-full rounded-full bg-indigo-400 transition-width'}
      style={{ width: percent + '%' }}
    />
  );
}

function BinBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={'bin h-full rounded-full bg-amber-500 transition-width'}
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
        'remaining h-full rounded-full bg-stone-700/20 transition-width'
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
  data?: UsageStats;
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
          'flex h-full w-full items-center gap-[1px]',
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
