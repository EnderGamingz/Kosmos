import { CloudIcon } from '@heroicons/react/24/outline';
import { formatBytes } from '@lib/fileSize.ts';
import { useUsage } from '@lib/query.ts';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { getExplorerLinks } from '@pages/explorer/nav/explorerLinks.tsx';
import { SideNavItem } from '@pages/explorer/nav/side/sideNavItem.tsx';
import { UsageIndicator } from '@components/usageIndicator.tsx';

export function SideNav() {
  const usage = useUsage();

  const limit = usage.data?.limit || 0;
  const total = usage.data?.total || 0;
  const bin = usage.data?.bin || 0;

  const links = getExplorerLinks(formatBytes(bin));

  return (
    <motion.aside
      className={tw(
        'body-bg z-40 flex flex-col whitespace-nowrap border-r border-stone-800/10 md:flex-grow md:bg-[initial] md:bg-none',
        'overflow-hidden transition-all md:h-[initial]',
      )}>
      <div className={'flex flex-col gap-2 p-3'}>
        {links.map(link => (
          <SideNavItem key={`side-nav-${link.name}`} link={link} />
        ))}
      </div>
      <div className={'mt-auto grid gap-2 border-t border-stone-800/10 p-5'}>
        <h2 className={'flex items-center gap-2 text-lg font-light md:text-xl'}>
          <CloudIcon className={'h-5 w-5'} />
          Account Storage
        </h2>
        <UsageIndicator data={usage.data} loading={usage.isLoading} />
        <div className={'text-sm text-stone-800 md:text-base'}>
          {formatBytes(total)}{' '}
          <span className={'text-stone-400'}>of {formatBytes(limit)}</span>
        </div>
      </div>
    </motion.aside>
  );
}
