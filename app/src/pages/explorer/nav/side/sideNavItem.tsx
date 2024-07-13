import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from '@lib/classMerge.ts';
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
  const navigate = useNavigate();

  const handleClick = () => {
    if (link.href) navigate(link.href);
    if (link.items) setOpen(!open);
  };

  return (
    <div className={tw('rounded-lg transition-all', open && 'bg-stone-300/30')}>
      <div
        onClick={handleClick}
        className={tw(
          'flex items-center gap-3 rounded-lg px-5 py-2 transition-all',
          'cursor-pointer hover:bg-stone-300 md:text-lg',
          open && 'shadow-md',
          small
            ? 'py-1 [&_svg]:h-5 [&_svg]:min-w-5'
            : '[&_svg]:h-6 [&_svg]:min-w-6',
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
          <div className={'mt-2 space-y-1'}>
            {link.items.map(item => (
              <SideNavItem small key={item.name} link={item} />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}
