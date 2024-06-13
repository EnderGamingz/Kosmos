import { Link } from 'react-router-dom';
import { useUserState } from '@stores/userStore';
import {
  ArrowRightEndOnRectangleIcon,
  GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline';
import { UserMenu } from './userMenu.tsx';
import { NewMenu } from './newMenu.tsx';

export default function Header() {
  const user = useUserState(s => s.user);

  return (
    <header
      className={
        'flex h-[90px] items-center border-b border-stone-800/10 px-6 py-5'
      }>
      <Link
        to={user ? '/home' : '/'}
        className={
          'flex items-center gap-2 rounded-lg p-2 text-stone-700 transition-all hover:bg-stone-700/5 '
        }>
        <GlobeAsiaAustraliaIcon className={'h-8 w-8'} />
        <span className={'text-2xl font-medium'}>Kosmos</span>
      </Link>
      <div className={'ml-auto flex items-center gap-4'}>
        {user ? (
          <>
            <NewMenu />
            <UserMenu />
          </>
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
