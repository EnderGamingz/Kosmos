import { BottomNavItem } from '@pages/explorer/nav/bottom/bottomNavItem.tsx';
import { useEffect, useMemo } from 'react';
import { getLinks, LinkSource } from '@pages/explorer/nav/side/getLinks.ts';
import { useAppState } from '@stores/appStateStore.ts';
import {
  ExplorerLink,
  getAdditionalLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';

export default function BottomNav({ source }: { source: LinkSource }) {
  const links = useMemo(() => getLinks(source), [source]);

  useHeaderMenu({ links });

  return (
    <aside className={'h-[80px] overflow-hidden bg-popover border-t'}>
      <div className={'grid grid-cols-4 gap-2 p-2'}>
        {links.map(link => (
          <BottomNavItem key={`bottom-nav-${link.name}`} link={link} />
        ))}
      </div>
    </aside>
  );
}

export function useHeaderMenu({ links }: { links: ExplorerLink[] }) {
  const { clearHeaderLinks, setHeaderLinks } = useAppState();

  useEffect(() => {
    const explorerLinks = getAdditionalLinks(links);
    setHeaderLinks(explorerLinks);
    return () => {
      clearHeaderLinks();
    };
  }, [links]);
}
