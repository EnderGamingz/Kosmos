import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { MouseEvent, ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { NavLink } from 'react-router-dom';
import tw from '@utils/classMerge.ts';

export function BottomNavItem({
  link,
  onClose,
}: {
  link: ExplorerLink;
  onClose?: () => void;
}) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (link.items) e.preventDefault();
    onClose?.();
  };

  return (
    <BottomNavPopoverWrapper link={link}>
      <NavLink
        onClick={handleClick}
        to={link.href || ''}
        end
        className={({ isActive }) =>
          tw(
            'grid cursor-pointer place-items-center px-2 py-2',
            'rounded-xl transition-colors hover:bg-stone-500/20',
            isActive && !!link.href && 'bg-stone-300/50',
          )
        }>
        <div className={'h-5 w-5'}>{link.icon}</div>
        <p className={'px-4 py-0.5 text-center'}>{link.name}</p>
      </NavLink>
    </BottomNavPopoverWrapper>
  );
}

function BottomNavPopoverWrapper({
  link,
  children,
}: {
  link: ExplorerLink;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!link.items) return children;

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div>{children}</div>
      </PopoverTrigger>
      <PopoverContent className={'bg-stone-100'}>
        <div className={'flex flex-wrap gap-1 p-1'}>
          {link.items.map(item => (
            <BottomNavItem
              link={item}
              key={item.name}
              onClose={() => setOpen(false)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
