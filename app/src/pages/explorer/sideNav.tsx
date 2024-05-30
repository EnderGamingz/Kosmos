import {
  ClockIcon,
  CloudIcon,
  HomeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Progress } from '@nextui-org/react';
import { formatBytes } from '../../lib/fileSize.ts';
import { useUsage } from '../../lib/query.ts';
import { Collapse } from 'react-collapse';

// 100 GiB
const WARN_LIMIT = 100 * 1024 * 1024 * 1024;

export function SideNav() {
  const usage = useUsage();

  const percentageUsage = ((usage.data?.active || 0) / WARN_LIMIT) * 100;

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
      href: '/home/bin',
      description: usage.data?.bin,
      icon: TrashIcon,
    },
  ];

  return (
    <aside className={'flex flex-grow flex-col border-r border-stone-800/10'}>
      <div className={'flex flex-col gap-2.5 p-5'}>
        {links.map(link => (
          <Link
            key={`side-nav-${link.name}`}
            to={link.href}
            className={
              'flex items-center gap-3 rounded-lg px-5 py-2 text-lg transition-colors hover:bg-stone-300'
            }>
            <link.icon className={'h-6 w-6'} />
            <div className={'grid'}>
              <p>{link.name}</p>
              <Collapse isOpened={!!link.description}>
                <p className={'text-xs text-stone-600'}>
                  {formatBytes(link.description)}
                </p>
              </Collapse>
            </div>
          </Link>
        ))}
      </div>
      <div className={'mt-auto grid gap-2 border-t border-stone-800/10 p-5'}>
        <h2 className={'flex items-center gap-2 text-xl font-light'}>
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
        <div className={'text-stone-800'}>
          {formatBytes(usage.data?.active || 0)}{' '}
          <span className={'text-stone-400'}>
            of {formatBytes(WARN_LIMIT, false, 0)}
          </span>
        </div>
      </div>
    </aside>
  );
}
