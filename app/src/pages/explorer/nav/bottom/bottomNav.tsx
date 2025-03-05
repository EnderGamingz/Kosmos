import { getBottomMoreLinks } from '@pages/explorer/nav/explorerLinks.tsx';
import { BottomNavItem } from '@pages/explorer/nav/bottom/bottomNavItem.tsx';
import { useMemo } from 'react';
import { getLinks, LinkSource } from '@pages/explorer/nav/side/getLinks.tsx';

export default function BottomNav({ source }: { source: LinkSource }) {
  const [links, more] = useMemo(() => {
    const explorerLinks = getLinks(source);
    return [explorerLinks, getBottomMoreLinks(explorerLinks)];
  }, [source]);

  return (
    <aside
      className={
        'h-[80px] overflow-hidden bg-stone-100 shadow-[0_-5px_10px_0_rgba(0,0,0,0.1)] dark:bg-stone-800'
      }>
      <div className={'grid grid-cols-4 gap-2 p-2'}>
        {links.map(link => (
          <BottomNavItem key={`bottom-nav-${link.name}`} link={link} />
        ))}
        {!!more.items?.length && (
          <BottomNavItem noPriority key={`bottom-nav-more`} link={more} />
        )}
      </div>
    </aside>
  );
}
