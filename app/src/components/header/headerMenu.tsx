import type { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import type { User } from '@stores/userStore.ts';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ui/sheet.tsx';
import { Menu } from 'lucide-react';
import {
  HeaderBranding,
  HeaderBrandingSitePartSwitcher,
  kosmosParts,
} from '@components/header/headerBranding.tsx';
import { useLocation } from 'react-router-dom';
import { useAppState } from '@stores/appStateStore.ts';
import { SideNavItem } from '@pages/explorer/nav/side/sideNavItem.tsx';
import { useUsageStats } from '@lib/query.ts';
import { SideNavUsage } from '@/pages/explorer/nav/side/sideNav';
import { cn } from '@lib/utils.ts';

function HeaderLinksMenu({
  links,
  user,
}: {
  links?: ExplorerLink[];
  user?: User;
}) {
  const usage = useUsageStats();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type={'button'}>
          <Menu className={'h-6 w-6'} />
          <span className={'sr-only'}>Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side={'left'} className={'p-2 pt-5 max-w-sm'}>
        <SheetHeader className={'sr-only'}>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Here are additional links for the page you are on
          </SheetDescription>
        </SheetHeader>
        <div className={'mr-10'}>
          <HeaderBranding
            noPartSwitcher
            expanded
            user={user}
            onClick={() => setOpen(false)}
          />
        </div>
        <hr />
        <div className={'flex flex-col gap-2 grow'}>
          {links?.map(link => (
            <SideNavItem
              key={`side-nav-${link.name}`}
              link={link}
              onClick={() => setOpen(false)}
            />
          ))}
          <hr className={'mt-auto'} />
          <p className={'px-1 text-center mb-1 text-muted-foreground text-sm'}>
            Kosmos
          </p>
          {kosmosParts.map(part => (
            <SideNavItem
              key={part.title}
              link={{
                name: part.title,
                href: part.link,
                icon: part.icon,
              }}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
        <SideNavUsage usage={usage} onClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function HeaderMenu({ user }: { user?: User }) {
  const location = useLocation();
  const headerLinks = useAppState(s => s.headerLinks);
  const isAuthPage =
    location.pathname.includes('login') ||
    location.pathname.includes('register');
  if (isAuthPage) return null;

  return (
    <>
      {user && (
        <div className={'md:hidden flex items-center gap-4'}>
          <HeaderLinksMenu links={headerLinks} user={user} />
          <HeaderBrandingSitePartSwitcher expanded noBrand />
        </div>
      )}
      <div className={cn(user && 'max-md:hidden')}>
        <HeaderBranding user={user} />
      </div>
    </>
  );
}
