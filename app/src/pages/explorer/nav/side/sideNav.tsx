import { useFormatBytes } from '@utils/fileSize.ts';
import { useUsageStats } from '@lib/query.ts';
import { SideNavItem } from '@pages/explorer/nav/side/sideNavItem.tsx';
import { UsageIndicator } from '@components/usage/usageIndicator.tsx';
import { Link } from 'react-router-dom';
import { ReactNode, useMemo } from 'react';
import { cn } from '@lib/utils.ts';
import { getLinks, LinkSource } from '@pages/explorer/nav/side/getLinks.tsx';
import { ArrowLeft, Cloud, SquareArrowOutUpRight } from 'lucide-react';

function SideNavWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        'flex flex-col whitespace-nowrap border-r border-stone-800/10 md:flex-grow md:bg-[initial] md:bg-none',
        'overflow-hidden md:h-[initial] dark:border-stone-300/10',
        className,
      )}>
      {children}
    </aside>
  );
}

export function ExplorerSideNav({ source }: { source: LinkSource }) {
  const usage = useUsageStats();

  const limit = usage.data?.limit || 0;
  const total = usage.data?.total || 0;
  const bin = usage.data?.bin || 0;

  const binUsage = useFormatBytes(bin);

  const links = useMemo(() => getLinks(source, binUsage), [source, binUsage]);

  return (
    <SideNavWrapper>
      <div className={'flex flex-col gap-2 p-3'}>
        {links.map(link => (
          <SideNavItem key={`side-nav-${link.name}`} link={link} />
        ))}
      </div>
      <div className={'mt-auto grid gap-2 border-t border-stone-800/10 p-5'}>
        <Link
          to={'/usage/report'}
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1 font-light',
            'hover:bg-stone-800/10 dark:hover:bg-stone-300/10',
          )}>
          <Cloud className={'h-5 w-5'} />
          Account Storage
          <SquareArrowOutUpRight className={'h-3 w-3'} />
        </Link>
        <UsageIndicator data={usage.data} loading={usage.isLoading} />
        <div
          className={'text-sm text-stone-800 md:text-base dark:text-stone-300'}>
          {useFormatBytes(total)}{' '}
          <span className={'text-stone-400 dark:text-stone-500'}>
            of {useFormatBytes(limit)}
          </span>
        </div>
      </div>
    </SideNavWrapper>
  );
}

export function SocialSideNav() {
  const links = getLinks('social');

  return (
    <SideNavWrapper className={'border-none'}>
      <div className={'flex flex-col gap-2 p-3'}>
        {links
          .filter(link => !link.onlyBottom)
          .map(link => (
            <SideNavItem key={`side-nav-${link.name}`} link={link} />
          ))}
      </div>
      <div className={'mt-auto'}>
        <hr className={'my-2'} />
        <SideNavItem
          link={{
            href: '/home',
            name: 'Back to Dashboard',
            icon: <ArrowLeft className={'h-5 w-5'} />,
          }}
        />
      </div>
    </SideNavWrapper>
  );
}
