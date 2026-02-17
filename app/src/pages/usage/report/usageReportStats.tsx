import type { ReactNode } from 'react';
import ConditionalWrapper from '@components/wrappers/ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { useFormatBytes } from '@utils/fileSize.ts';
import { UsageIndicator } from '@components/usage/usageIndicator.tsx';
import type { DiskUsageReport } from '@bindings/DiskUsageReport.ts';
import type { DiskUsageStats } from '@bindings/DiskUsageStats.ts';
import { cn } from '@lib/utils.ts';
import { Files, HardDrive, Trash2 } from 'lucide-react';

export function UsageReportStats({
  report,
  usage,
}: {
  report?: DiskUsageReport;
  usage: DiskUsageStats;
}) {
  return (
    <section>
      <div className={'flex flex-col gap-1'}>
        <span className={'ml-auto text-xs text-stone-500 dark:text-stone-400'}>
          {useFormatBytes(usage.total)}, Total: {useFormatBytes(usage.limit)}
        </span>
        <UsageIndicator
          large
          data={{
            bin: usage.bin,
            active: usage.active,
            total: usage.total,
            limit: usage.limit,
          }}
        />
      </div>
      {report && (
        <ul
          className={
            'mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'
          }
        >
          <UsageReportItem
            sum={report.active_storage.sum}
            count={report.active_storage.count}
            icon={<Files />}
            label={'Files'}
            index={0}
          />
          <UsageReportItem
            sum={report.bin_storage.sum}
            count={report.bin_storage.count}
            link={'/home/bin'}
            icon={<Trash2 />}
            label={'Files in Bin'}
            index={1}
          />
          <UsageReportItem
            sum={usage.limit - usage.total}
            icon={<HardDrive />}
            label={'Free Space'}
            index={2}
          />
        </ul>
      )}
    </section>
  );
}

function UsageReportItem({
  sum,
  count,
  icon,
  label,
  link,
  index,
}: {
  sum: number;
  count?: number;
  icon: ReactNode;
  link?: string;
  label: string;
  index: number;
}) {
  return (
    <li
      style={{
        animationDelay: `${(index + 1) * 100 + 200}ms`,
      }}
      className={cn(
        'flex items-center gap-2 rounded-lg bg-stone-300/20 px-4 py-2 text-stone-800',
        'border border-stone-600/30 animate-fade-in-top',
        'dark:bg-stone-800/20 dark:text-stone-300 dark:border-stone-400/30',
      )}
    >
      <div className={'[&_svg]:h-7 [&_svg]:w-7'}>{icon}</div>
      <div>
        <ConditionalWrapper
          wrapper={c => (
            <Link
              className={
                'cursor-pointer underline decoration-1 underline-offset-2'
              }
              to={link!}
            >
              {c}
            </Link>
          )}
          condition={!!link}
        >
          <p className={'text-3xl'}>{useFormatBytes(sum)}</p>
        </ConditionalWrapper>
        <p className={'text-sm'}>{count ? `${count} ${label}` : label}</p>
      </div>
    </li>
  );
}
