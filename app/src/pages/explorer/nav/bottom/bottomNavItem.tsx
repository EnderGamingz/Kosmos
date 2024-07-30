import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import { MouseEvent, ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { NavLink } from 'react-router-dom';
import tw from '@utils/classMerge.ts';

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
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (link.items) e.preventDefault();
    onClose?.();
  };

  return (
    <BottomNavPopoverWrapper noPriority={noPriority} link={link}>
      <NavLink
        onClick={handleClick}
        to={link.href || ''}
        end={link.exact}
        className={({ isActive }) =>
          tw(
            'grid cursor-pointer place-items-center px-2 py-2',
            'rounded-xl transition-colors hover:bg-stone-500/20',
            isActive && !!link.href && 'bg-stone-300/50',
          )
        }>
        <div className={'h-5 w-5'}>{link.icon}</div>
        <p className={'py-0.5 text-center sm:px-4'}>{link.name}</p>
      </NavLink>
    </BottomNavPopoverWrapper>
  );
}

function BottomNavPopoverWrapper({
  link,
  children,
  noPriority,
}: {
  link: ExplorerLink;
  children: ReactNode;
  noPriority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!link.items) return children;

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div>{children}</div>
      </PopoverTrigger>
      <PopoverContent className={'bg-stone-100'}>
        <div
          className={'grid gap-1 py-1'}
          style={{
            gridTemplateColumns: `repeat(${link.items.length}, minmax(0, 1fr))`,
          }}>
          {link.items.map(item => (
            <BottomNavItem
              noPriority={noPriority}
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
