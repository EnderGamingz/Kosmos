import type { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { NavLink } from 'react-router-dom';
import { cn } from '@lib/utils.ts';

export function SideNavItem({
  link,
  small,
  onClick,
}: {
  link: ExplorerLink;
  small?: boolean;
  onClick?: () => void;
}) {
  const Icon = link.icon;

  return (
    <NavLink
      onClick={() => onClick?.()}
      to={link.href || ''}
      end={link.exact}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-4 py-1 transition-colors',
          'cursor-pointer hover:bg-stone-300 md:text-lg dark:text-stone-300 dark:hover:bg-stone-500/20',
          isActive &&
            !!link.href &&
            'ring ring-ring bg-stone-300/50 dark:bg-stone-700/40',
        )
      }
    >
      <Icon className={'size-6'} />
      <div className={'flex w-full items-center justify-between'}>
        <p className={cn(small ? 'text-base' : 'text-lg')}>{link.name}</p>
        {link.description && (
          <p className={'text-xs text-stone-600 dark:text-stone-500'}>
            {link.description}
          </p>
        )}
      </div>
    </NavLink>
  );
}
