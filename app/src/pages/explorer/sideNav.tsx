import {
  ClockIcon,
  CloudIcon,
  HomeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Progress } from '@nextui-org/react';
import { formatBytes } from '@lib/fileSize.ts';
import { useUsage } from '@lib/query.ts';
import tw from '@lib/classMerge.ts';
import { useExplorerStore } from '@stores/folderStore.ts';
import { SideNavToggle } from '@pages/explorer/components/sideNavToggle.tsx';
import { motion } from 'framer-motion';

export function SideNav() {
  const navControls = useExplorerStore(s => s.sidenav);
  const usage = useUsage();

  const limit = usage.data?.limit || 0;
  const total = usage.data?.total || 0;
  const bin = usage.data?.bin || 0;

  const percentageUsage = (total / limit) * 100;

  const links = [
    {
      name: 'Home',
      href: '/home',
      icon: HomeIcon,
    },
    {
      name: 'Recent',
      href: '/home/recent',
      icon: ClockIcon,
    },
    {
      name: 'Bin',
      elId: 'bin-icon',
      href: '/home/bin',
      description: formatBytes(bin),
      icon: TrashIcon,
    },
  ];

  return (
    <motion.aside
      initial={{ width: '0%' }}
      animate={{ width: navControls.open ? '100%' : '0%' }}
      transition={{ duration: 0.1 }}
      className={tw(
        'body-bg z-40 flex flex-col whitespace-nowrap border-r border-stone-800/10 md:flex-grow md:bg-[initial] md:bg-none',
        'h-[calc(100vh-90px)] overflow-hidden transition-all md:h-[initial]',
      )}>
      <div className={'px-4 pt-3 text-sm font-light md:hidden'}>
        <SideNavToggle text={'Close Sidebar'} />
      </div>
      <div className={'flex flex-col gap-2 p-3'}>
        {links.map(link => (
          <Link
            onClick={() => navControls.toggle()}
            key={`side-nav-${link.name}`}
            to={link.href}
            className={
              'flex items-center gap-3 rounded-lg px-5 py-2 text-base transition-colors hover:bg-stone-300 md:text-lg'
            }>
            <link.icon id={link.elId} className={'h-6 min-w-6'} />
            <div className={'flex w-full items-center justify-between'}>
              <p>{link.name}</p>
              {link.description && (
                <p className={'text-xs text-stone-600'}>{link.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className={'mt-auto grid gap-2 border-t border-stone-800/10 p-5'}>
        <h2 className={'flex items-center gap-2 text-lg font-light md:text-xl'}>
          <CloudIcon className={'h-6 w-6'} />
          Storage Usage
        </h2>
        <Progress
          aria-label={'Usage percent'}
          className={'h-2'}
          color={
            percentageUsage > 100
              ? 'danger'
              : percentageUsage > 90
                ? 'warning'
                : 'default'
          }
          isIndeterminate={usage.isLoading}
          value={percentageUsage}
        />
        <div className={'text-sm text-stone-800 md:text-base'}>
          {formatBytes(total)}{' '}
          <span className={'text-stone-400'}>of {formatBytes(limit, 0)}</span>
        </div>
      </div>
    </motion.aside>
  );
}
