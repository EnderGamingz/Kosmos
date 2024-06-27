import { Link } from 'react-router-dom';
import { useUserState } from '@stores/userStore';
import {
  ArrowRightEndOnRectangleIcon,
  GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline';
import { UserMenu } from './userMenu.tsx';
import { NewMenu } from './newMenu.tsx';
import { NotificationsMenu } from '@components/header/notificationsMenu.tsx';
import tw from '@lib/classMerge.ts';

export default function Header() {
  const user = useUserState(s => s.user);

  return (
    <header
      className={
        'z-30 flex h-[90px] items-center border-b border-stone-800/10 px-6 py-5'
      }>
      <Link
        to={user ? '/home' : '/'}
        className={
          'flex items-center gap-2 rounded-lg p-2 text-stone-700 transition-all hover:bg-stone-700/5'
        }>
        <GlobeAsiaAustraliaIcon className={'h-8 w-8'} />
        <span className={'hidden text-2xl font-semibold sm:block'}>Kosmos</span>
      </Link>
      <div className={'ml-auto flex items-center gap-4'}>
        {user ? (
          <div
            className={tw(
              'rounded-lg bg-stone-700/5 px-2 py-1 text-stone-700',
              'flex items-center gap-4 rounded-lg transition-all',
            )}>
            <NewMenu />
            <NotificationsMenu />
            <UserMenu />
          </div>
        ) : (
          <>
            <Link to={'/auth/login'} className={'btn-black'}>
              <ArrowRightEndOnRectangleIcon /> Login
            </Link>
            <Link to={'/auth/register'} className={'btn-white'}>
              <ArrowRightEndOnRectangleIcon /> Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
