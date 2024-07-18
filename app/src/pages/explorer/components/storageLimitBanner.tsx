import { useUsageStats } from '@lib/query.ts';
import { getPercentageStats } from '@components/getPercentage.ts';
import tw from '@lib/classMerge.ts';
import { formatBytes } from '@lib/fileSize.ts';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dismiss, useDismissStore } from '@stores/dismissStore.ts';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function StorageLimitBanner() {
  const usage = useUsageStats();
  const percentages = getPercentageStats(usage.data, usage.isFetched);
  const usedStorage = formatBytes(usage.data?.total || 0);
  const storageLimit = formatBytes(usage.data?.limit || 0);

  const isDismissed = useDismissStore(s => s.isDismissed(Dismiss.StorageLimit));
  const resetDismiss = useDismissStore(s => s.actions.reset);

  useEffect(() => {
    // Reset the dismissed state when the warning is gone
    if (percentages.isLoaded && !percentages.warningLimit && isDismissed) {
      resetDismiss(Dismiss.StorageLimit);
    }
  }, [isDismissed, percentages, resetDismiss]);

  return (
    <AnimatePresence>
      {!isDismissed && percentages.warningLimit && !usage.isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
          }}
          className={tw(
            'm-4 shrink-0 overflow-hidden rounded-xl outline outline-1',
            percentages.warningLimit && 'bg-yellow-100/40 outline-yellow-600',
            percentages.alertLimit && 'bg-red-100/40 outline-red-600',
          )}>
          <div className={'space-y-2 p-4 '}>
            <h2 className={'text-xl'}>
              You have <strong>{percentages.remainingPercentage}%</strong>{' '}
              storage left
            </h2>
            <p>
              You have used{' '}
              <strong>
                {usedStorage} of {storageLimit}
              </strong>{' '}
              storage.
              <br />
              Consider deleting files to free up space.
            </p>
            <div className={'flex flex-col gap-4 sm:flex-row'}>
              <Link className={'btn-black'} to={'/usage/report'}>
                <ArrowTopRightOnSquareIcon />
                Usage Report
              </Link>
              <DismissButton id={Dismiss.StorageLimit} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DismissButton({ id }: { id: Dismiss }) {
  const dismiss = useDismissStore(s => s.actions.dismiss);

  return (
    <button onClick={() => dismiss(id)} className={'btn-white'}>
      <XMarkIcon />
      Dismiss
    </button>
  );
}
