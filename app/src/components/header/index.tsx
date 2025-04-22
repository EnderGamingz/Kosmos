import { Link } from 'react-router-dom';
import { useUserState } from '@stores/userStore';
import { UserMenu } from './userMenu.tsx';
import { NewMenu } from './new/newMenu.tsx';
import { NotificationsMenu } from '@components/header/notifications/notificationsMenu.tsx';
import { ALLOW_REGISTER } from '@lib/env.ts';
import {
  SearchBar,
  SearchPopup,
} from '@components/header/search/searchBar.tsx';
import { cn } from '@lib/utils.ts';
import { SocialHeaderLink } from '@components/header/socialHeaderLink.tsx';
import { LogIn } from 'lucide-react';
import { HeaderMenu } from '@components/header/headerMenu.tsx';

export default function Header() {
  const user = useUserState(s => s.user);

  return (
    <header
      className={
        'z-30 flex h-[90px] items-center border-b border-stone-800/10 px-6 py-5 dark:border-stone-300/10'
      }>
      <HeaderMenu user={user} />
      {user && (
        <div className={'mx-auto w-full max-w-md px-3 md:px-10'}>
          <div className={'max-md:hidden'}>
            <SearchBar />
          </div>
        </div>
      )}
      <div
        className={cn(
          'rounded-lg bg-stone-700/5 px-2 py-1',
          'flex items-center gap-2 rounded-lg',
          'dark:bg-stone-700/30',
          '[&>button:hover]:bg-stone-600/10 dark:[&>button:hover]:bg-stone-300/20 [&>button]:rounded-lg [&>button]:transition-colors [&>button]:duration-150',
          '[&>a:hover]:bg-stone-600/10 dark:[&>a:hover]:bg-stone-300/20 [&>a]:rounded-lg [&>a]:transition-colors [&>a]:duration-150',
          '[&_svg]:h-5 [&_svg]:w-5',
          !user && 'ml-auto',
        )}>
        {user ? (
          <>
            <div className={'max-md:hidden'}>
              <SearchPopup />
            </div>
            <NewMenu />
            <NotificationsMenu />
            <div className={'max-md:hidden'}>
              <SocialHeaderLink />
            </div>
            <UserMenu />
          </>
        ) : (
          <>
            <Link to={'/auth/login'} className={'header-login-btn'}>
              <LogIn /> Login
            </Link>
            {ALLOW_REGISTER && (
              <Link
                to={'/auth/register'}
                className={
                  'header-login-btn bg-stone-700/80 text-stone-200 hover:bg-stone-700 dark:bg-stone-300/20 dark:text-stone-300'
                }>
                Register
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
