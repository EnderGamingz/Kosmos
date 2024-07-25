import {
  ArrowTopRightOnSquareIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import { formatBytes } from '@utils/fileSize.ts';
import { useUsageStats } from '@lib/query.ts';
import tw from '@utils/classMerge.ts';
import { motion } from 'framer-motion';
import {
  getAdminLinks,
  getExplorerLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import { SideNavItem } from '@pages/explorer/nav/side/sideNavItem.tsx';
import { UsageIndicator } from '@components/usage/usageIndicator.tsx';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export function SideNav({ admin }: { admin?: boolean }) {
  const usage = useUsageStats();

  const limit = usage.data?.limit || 0;
  const total = usage.data?.total || 0;
  const bin = usage.data?.bin || 0;

  const binUsage = formatBytes(bin);

  const links = useMemo(() => {
    if (admin) {
      return getAdminLinks();
    }
    return getExplorerLinks(binUsage);
  }, [admin, binUsage]);

  return (
    <motion.aside
      className={tw(
        'body-bg flex flex-col whitespace-nowrap border-r border-stone-800/10 md:flex-grow md:bg-[initial] md:bg-none',
        'overflow-hidden transition-all md:h-[initial]',
      )}>
      <div className={'flex flex-col gap-2 p-3'}>
        {links.map(link => (
          <SideNavItem key={`side-nav-${link.name}`} link={link} />
        ))}
      </div>
      <div className={'mt-auto grid gap-2 border-t border-stone-800/10 p-5'}>
        <Link
          to={'/usage/report'}
          className={
            'flex items-center gap-2 rounded-lg px-2 py-1 font-light hover:bg-stone-800/10'
          }>
          <CloudIcon className={'h-5 w-5'} />
          Account Storage
          <ArrowTopRightOnSquareIcon className={'h-3 w-3'} />
        </Link>
        <UsageIndicator data={usage.data} loading={usage.isLoading} />
        <div className={'text-sm text-stone-800 md:text-base'}>
          {formatBytes(total)}{' '}
          <span className={'text-stone-400'}>of {formatBytes(limit)}</span>
        </div>
      </div>
    </motion.aside>
  );
}
