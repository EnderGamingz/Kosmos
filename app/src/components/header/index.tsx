import { Link, useLocation } from 'react-router-dom';
import { useUserState } from '@stores/userStore';
import {
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { UserMenu } from './userMenu.tsx';
import { NewMenu } from './new/newMenu.tsx';
import { NotificationsMenu } from '@components/header/notificationsMenu.tsx';
import tw from '@utils/classMerge.ts';
import { ALLOW_REGISTER } from '@lib/env.ts';
import { HeaderBranding } from '@components/header/headerBranding.tsx';
import {
  SearchBar,
  SearchPopup,
} from '@components/header/search/searchBar.tsx';

export default function Header() {
  const location = useLocation();
  const user = useUserState(s => s.user);

  const isAuthPage =
    location.pathname.includes('login') ||
    location.pathname.includes('register');

  return (
    <header
      className={
        'z-30 flex h-[90px] items-center border-b border-stone-800/10 px-6 py-5 dark:border-stone-300/10'
      }>
      {!isAuthPage && <HeaderBranding user={user} />}
      {user && <SearchBar />}
      <div
        className={tw(
          'rounded-lg bg-stone-700/5 px-2 py-1',
          'flex items-center gap-2 rounded-lg',
          'dark:bg-stone-700/30',
          !user && 'ml-auto',
        )}>
        {user ? (
          <>
            <SearchPopup />
            <NewMenu />
            <NotificationsMenu />
            <UserMenu />
          </>
        ) : (
          <>
            <Link to={'/auth/login'} className={'header-login-btn'}>
              <ArrowRightEndOnRectangleIcon /> Login
            </Link>
            {ALLOW_REGISTER && (
              <Link
                to={'/auth/register'}
                className={
                  'header-login-btn bg-stone-700/80 text-stone-200 hover:bg-stone-700 dark:bg-stone-300/20 dark:text-stone-300'
                }>
                <UserPlusIcon /> Register
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
