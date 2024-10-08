import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';
import tw from '@utils/classMerge.ts';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { useFormatBytes } from '@utils/fileSize.ts';
import { UsageIndicator } from '@components/usage/usageIndicator.tsx';
import {
  CircleStackIcon,
  DocumentIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { DiskUsageReport } from '@bindings/DiskUsageReport.ts';
import { DiskUsageStats } from '@bindings/DiskUsageStats.ts';

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
        <motion.ul
          variants={containerVariant(0.08, 0.2)}
          initial={'hidden'}
          animate={'show'}
          className={
            'mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'
          }>
          <UsageReportItem
            sum={report.active_storage.sum}
            count={report.active_storage.count}
            icon={<DocumentIcon />}
            label={'Files'}
          />
          <UsageReportItem
            sum={report.bin_storage.sum}
            count={report.bin_storage.count}
            link={'/home/bin'}
            icon={<TrashIcon />}
            label={'Files in Bin'}
          />
          <UsageReportItem
            sum={usage.limit - usage.total}
            icon={<CircleStackIcon />}
            label={'Free Space'}
          />
        </motion.ul>
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
}: {
  sum: number;
  count?: number;
  icon: ReactNode;
  link?: string;
  label: string;
}) {
  return (
    <motion.li
      variants={itemTransitionVariantFadeInFromTop}
      className={tw(
        'flex items-center gap-2 rounded-lg bg-stone-300/20 px-4 py-2 text-stone-800',
        'outline outline-1 outline-stone-800/30',
        'dark:bg-stone-800/20 dark:text-stone-300 dark:outline-stone-400/30',
      )}>
      <div className={'[&_svg]:h-7 [&_svg]:w-7'}>{icon}</div>
      <div>
        <ConditionalWrapper
          wrapper={c => (
            <Link
              className={
                'cursor-pointer underline decoration-1 underline-offset-2'
              }
              to={link!}>
              {c}
            </Link>
          )}
          condition={!!link}>
          <p className={'text-3xl'}>{useFormatBytes(sum)}</p>
        </ConditionalWrapper>
        <p className={'text-sm'}>{count ? `${count} ${label}` : label}</p>
      </div>
    </motion.li>
  );
}
