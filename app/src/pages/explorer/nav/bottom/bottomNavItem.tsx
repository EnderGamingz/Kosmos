import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { NavLink } from 'react-router-dom';
import { cn } from '@lib/utils.ts';

export function BottomNavItem({
  link,
  onClose,
  noPriority,
}: {
  link: ExplorerLink;
  onClose?: () => void;
  noPriority?: boolean;
}) {
  if (link.lessPriority && !noPriority) return null;

  const Icon = link.icon;

  return (
    <NavLink
      onClick={() => onClose?.()}
      to={link.href || ''}
      end={link.exact}
      className={({ isActive }) =>
        cn(
          'group grid cursor-pointer place-items-center px-2 py-1',
          'rounded-md',
          isActive &&
            !!link.href &&
            '[&>.icon-wrapper]:bg-gradient-to-br [&>.icon-wrapper]:ring-border',
        )
      }>
      <div
        className={
          'py-1 px-5 rounded-full icon-wrapper group-hover:ring ring-stone-600 transition-all from-primary/5 to-primary/20'
        }>
        <Icon className={'h-5 w-5'} />
      </div>
      <p className={'py-0.5 text-center sm:px-4 text-sm'}>{link.name}</p>
    </NavLink>
  );
}
