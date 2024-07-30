import {
  getBottomMoreLinks,
  getExplorerLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import { BottomNavItem } from '@pages/explorer/nav/bottom/bottomNavItem.tsx';

export default function BottomNav() {
  const links = getExplorerLinks();
  const more = getBottomMoreLinks();

  return (
    <aside
      className={
        'h-[80px] overflow-hidden bg-stone-100 shadow-[0_-5px_10px_0_rgba(0,0,0,0.1)]'
      }>
      <div className={'grid grid-cols-4 gap-2 p-2'}>
        {links.map(link => (
          <BottomNavItem key={`bottom-nav-${link.name}`} link={link} />
        ))}
        <BottomNavItem noPriority key={`bottom-nav-more`} link={more} />
      </div>
    </aside>
  );
}
