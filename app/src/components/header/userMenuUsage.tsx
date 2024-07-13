import { useUsage } from '@lib/query.ts';
import { CloudIcon } from '@heroicons/react/24/outline';
import { UsageIndicator } from '@components/usageIndicator.tsx';
import { formatBytes } from '@lib/fileSize.ts';

export function UserMenuUsage() {
  const usage = useUsage();
  return (
    <div className={'space-y-1 text-stone-800'}>
      <p className={'flex items-center gap-2'}>
        <CloudIcon className={'h-4 w-4'} />
        Account Storage
      </p>
      <UsageIndicator data={usage.data} loading={usage.isLoading} small />
      <p className={'text-xs'}>
        {formatBytes(usage.data?.total || 0)}{' '}
        <span className={'text-stone-400'}>
          of {formatBytes(usage.data?.limit || 0)} used
        </span>
      </p>
    </div>
  );
}
