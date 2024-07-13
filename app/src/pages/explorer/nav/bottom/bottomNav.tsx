import {
  ExplorerLink,
  getExplorerLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import tw from '@lib/classMerge.ts';
import { useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';

export default function BottomNav() {
  const links = getExplorerLinks();

  return (
    <aside
      className={
        'h-[80px] overflow-hidden bg-stone-100 shadow-[0_-5px_10px_0_rgba(0,0,0,0.1)]'
      }>
      <div className={'grid grid-cols-4 gap-2 p-2'}>
        {links.map(link => (
          <BottomNavItem key={`bottom-nav-${link.name}`} link={link} />
        ))}
      </div>
    </aside>
  );
}

function BottomNavItem({
  link,
  onClose,
}: {
  link: ExplorerLink;
  onClose?: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link.href) navigate(link.href);
    onClose?.();
  };

  return (
    <BottomNavPopoverWrapper link={link}>
      <div
        onClick={handleClick}
        className={tw(
          'grid cursor-pointer place-items-center px-2 py-2',
          'rounded-xl transition-colors hover:bg-stone-500/20',
        )}>
        <div className={'h-5 w-5'}>{link.icon}</div>
        <p className={'px-4 py-0.5 text-center'}>{link.name}</p>
      </div>
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
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className={'bg-stone-100'}>
        <div className={'flex flex-wrap p-1'}>
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
