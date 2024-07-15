import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';
import tw from '@lib/classMerge.ts';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { formatBytes } from '@lib/fileSize.ts';
import { UsageReport, UsageStats } from '@models/usage.ts';
import { UsageIndicator } from '@components/usageIndicator.tsx';
import {
  CircleStackIcon,
  DocumentIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export function UsageReportStats({
  report,
  usage,
}: {
  report: UsageReport;
  usage: UsageStats;
}) {
  return (
    <section>
      <div className={'flex flex-col gap-1'}>
        <span className={'ml-auto text-xs text-stone-500'}>
          Total: {formatBytes(usage.limit)}
        </span>
        <UsageIndicator
          large
          data={{
            bin: report.bin_storage.sum,
            active: report.active_storage.sum,
            total: usage.total,
            limit: usage.limit,
          }}
        />
      </div>
      <motion.ul
        variants={containerVariant(0.08, 0.2)}
        initial={'hidden'}
        animate={'show'}
        className={'mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'}>
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
          <p className={'text-3xl'}>{formatBytes(sum)}</p>
        </ConditionalWrapper>
        <p className={'text-sm'}>{count ? `${count} ${label}` : label}</p>
      </div>
    </motion.li>
  );
}
