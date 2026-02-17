import { BottomNavItem } from '@pages/explorer/nav/bottom/bottomNavItem.tsx';
import { useMemo } from 'react';
import {
  getLinks,
  type LinkSource,
} from '@pages/explorer/nav/side/getLinks.ts';
import { useHeaderMenu } from '@pages/explorer/nav/bottom/useHeaderMenu.tsx';

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
