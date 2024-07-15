import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { Progress } from '@nextui-org/react';
import { UsageStats } from '@models/usage.ts';

function ActiveBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={'h-full rounded-full bg-indigo-400 transition-width'}
      style={{ width: percent + '%' }}
    />
  );
}

function BinBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={'h-full rounded-full bg-amber-500 transition-width'}
      style={{ width: percent + '%' }}
    />
  );
}

export function AvailableBar({ percent }: { percent: number }) {
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: `${percent}%` }}
      className={'h-full rounded-full bg-stone-700/20 transition-width'}
      style={{ width: percent + '%' }}
    />
  );
}

const calculatePercentage = (value: number = 0, limit: number): number =>
  Math.min(100, Math.max(0, Math.floor((value / limit) * 100)));

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
  const limit = data?.limit || 1;

  const percentageActive = calculatePercentage(data?.active, limit);
  const percentageBin = calculatePercentage(data?.bin, limit);
  const remainingPercentage = 100 - percentageActive - percentageBin;

  const anyPercentageExceedsLimit = [percentageActive, percentageBin].some(
    x => x > 99,
  );

  return (
    <div className={tw(small ? 'h-1' : large ? 'h-5' : 'h-2')}>
      <div
        className={tw(
          'flex h-full w-full items-center gap-[1px]',
          anyPercentageExceedsLimit && '[&>div]:bg-red-500',
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
