import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { MouseEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';
import tw from '@utils/classMerge.ts';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { Collapse } from 'react-collapse';

export function SideNavItem({
  link,
  small,
}: {
  link: ExplorerLink;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (link.items) e.preventDefault();
    if (link.items) setOpen(!open);
  };

  return (
    <div
      className={tw(
        'rounded-lg transition-all',
        open && 'bg-stone-300/30 dark:bg-stone-700/30',
      )}>
      <NavLink
        onClick={e => handleClick(e)}
        to={link.href || ''}
        end={link.exact}
        className={({ isActive }) =>
          tw(
            'flex items-center gap-3 rounded-lg px-5 py-2 transition-background',
            'cursor-pointer hover:bg-stone-300 md:text-lg dark:text-stone-300 dark:hover:bg-stone-500/20',
            open && 'shadow-md',
            small
              ? 'py-1 [&_svg]:h-5 [&_svg]:min-w-5'
              : '[&_svg]:h-6 [&_svg]:min-w-6',
            isActive && !!link.href && 'bg-stone-300/50 dark:bg-stone-700/40',
          )
        }>
        {link.icon}
        <div className={'flex w-full items-center justify-between'}>
          <p className={tw(small ? 'text-base' : 'text-lg')}>{link.name}</p>
          {link.description && (
            <p className={'text-xs text-stone-600 dark:text-stone-500'}>
              {link.description}
            </p>
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
      </NavLink>
      {link.items && (
        <Collapse isOpened={open}>
          <div className={'mt-2 space-y-1 p-1'}>
            {link.items.map(item => (
              <SideNavItem small key={item.name} link={item} />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}
