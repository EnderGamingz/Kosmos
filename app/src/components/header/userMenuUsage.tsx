import { useUsageStats } from '@lib/query.ts';
import {
  ArrowTopRightOnSquareIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import { UsageIndicator } from '@components/usageIndicator.tsx';
import { formatBytes } from '@lib/fileSize.ts';
import { Link } from 'react-router-dom';

export function UserMenuUsage({ onClick }: { onClick?: () => void }) {
  const usage = useUsageStats();
  return (
    <Link
      to={'/usage/report'}
      className={'space-y-1 text-stone-800'}
      onClick={onClick}>
      <p className={'flex items-center gap-2'}>
        <CloudIcon className={'h-4 w-4'} />
        Account Storage
        <ArrowTopRightOnSquareIcon className={'h-3 w-3'} />
      </p>
      <UsageIndicator data={usage.data} loading={usage.isLoading} small />
      <p className={'text-xs'}>
        {formatBytes(usage.data?.total || 0)}{' '}
        <span className={'text-stone-400'}>
          of {formatBytes(usage.data?.limit || 0)} used{' '}
        </span>
      </p>
    </Link>
  );
}
