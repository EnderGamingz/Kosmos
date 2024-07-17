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

export default function StorageLimitBanner() {
  const usage = useUsageStats();
  const percentages = getPercentageStats(usage.data);
  const usedStorage = formatBytes(usage.data?.total || 0);
  const storageLimit = formatBytes(usage.data?.limit || 0);

  const isDismissed = useDismissStore(s => s.isDismissed(Dismiss.StorageLimit));
  const resetDismiss = useDismissStore(s => s.actions.reset);

  useEffect(() => {
    // Reset the dismissed state when the warning is gone
    if (usage.data && !percentages.warningLimit && isDismissed) {
      resetDismiss(Dismiss.StorageLimit);
    }
  }, [isDismissed, percentages.warningLimit, resetDismiss, usage.data]);

  if (!percentages.warningLimit || isDismissed) return null;

  return (
    <div
      className={tw(
        'm-4 space-y-2 rounded-xl p-4 outline outline-1 outline-stone-800',
        percentages.warningLimit && 'bg-yellow-100/40 outline-yellow-600',
        percentages.alertLimit && 'bg-red-100/40 outline-red-600',
      )}>
      <h2 className={'text-xl'}>
        You have <strong>{percentages.remainingPercentage}%</strong> storage
        left
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
