import {
  ChevronUpIcon,
  ClockIcon,
  CloudIcon,
  HomeIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@nextui-org/react';
import { formatBytes } from '@lib/fileSize.ts';
import { useUsage } from '@lib/query.ts';
import tw from '@lib/classMerge.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { SideNavToggle } from '@pages/explorer/components/sideNavToggle.tsx';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Collapse } from 'react-collapse';

type SideNavLink = {
  name: string;
  icon: ReactNode;
  href?: string;
  elId?: string;
  description?: string;
  items?: SideNavLink[];
};

function SideNavItem({
  link,
  onToggle,
  small,
}: {
  onToggle: () => void;
  link: SideNavLink;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (link.href) {
      navigate(link.href);
      onToggle();
    }

    if (link.items) {
      setOpen(!open);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={tw(
          'flex items-center gap-3 rounded-lg px-5 py-2 transition-colors',
          'mt-2 hover:bg-stone-300 md:text-lg',
          small
            ? 'py-1 md:[&_svg]:h-5 md:[&_svg]:w-5'
            : 'md:[&_svg]:h-6 md:[&_svg]:w-6',
        )}>
        <div id={link.elId}>{link.icon}</div>
        <div className={'flex w-full items-center justify-between'}>
          <p className={tw(small ? 'text-base' : 'text-lg')}>{link.name}</p>
          {link.description && (
            <p className={'text-xs text-stone-600'}>{link.description}</p>
          )}
          {link.items && (
            <ChevronUpIcon
              className={tw(
                '!h-4 !w-4 rotate-180 transition-transform',
                open && 'rotate-0',
              )}
            />
          )}
        </div>
      </div>
      {link.items && (
        <Collapse isOpened={open}>
          {link.items.map(item => (
            <SideNavItem
              small
              key={item.name}
              link={item}
              onToggle={onToggle}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}

export function SideNav() {
  const navControls = useExplorerStore(s => s.sidenav);
  const usage = useUsage();

  const limit = usage.data?.limit || 0;
  const total = usage.data?.total || 0;
  const bin = usage.data?.bin || 0;

  const percentageUsage = (total / limit) * 100;

  const links: SideNavLink[] = [
    {
      name: 'Home',
      href: '/home',
      icon: <HomeIcon />,
    },
    {
      name: 'Recent',
      href: '/home/recent',
      icon: <ClockIcon />,
    },
    {
      name: 'Share',
      icon: <ShareIcon />,
      items: [
        {
          name: 'Shared with me',
          href: '/home/shares',
          icon: <UserIcon />,
        },
        {
          name: 'My shares',
          href: '/home/shared',
          icon: <CloudIcon />,
        },
      ],
    },
    {
      name: 'Bin',
      elId: 'bin-icon',
      href: '/home/bin',
      description: formatBytes(bin),
      icon: <TrashIcon />,
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
      <div className={'flex flex-col p-3'}>
        {links.map(link => (
          <SideNavItem
            key={`side-nav-${link.name}`}
            onToggle={() => navControls.toggle()}
            link={link}
          />
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
