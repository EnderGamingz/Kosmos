import { Link } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  ClockIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { ALLOW_REGISTER } from '@lib/env.ts';
import { useUserState } from '@stores/userStore.ts';
import { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';
import UserAvatar from '@components/UserAvatar.tsx';
import getCurrentTimeSection from '@utils/getCurrentTimeSection.ts';

function HeroLink({
  to,
  icon,
  children,
  className = '',
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-full bg-stone-50 px-6 py-2 font-medium text-stone-900 sm:px-10 sm:py-4',
        'text-lg transition-colors hover:bg-stone-300 sm:text-2xl dark:bg-stone-300 dark:text-stone-800 dark:hover:bg-stone-400',
        className,
      )}>
      {icon}
      {children}
    </Link>
  );
}

export function Hero() {
  const user = useUserState(s => s.user);
  return (
    <div className={'flex sm:h-[calc(100dvh-90px)] sm:max-h-[600px]'}>
      <div
        className={cn(
          'relative flex-grow overflow-hidden bg-stone-900 shadow-lg',
          'grid p-10 md:p-16 lg:p-24',
        )}>
        <img
          src={'/img/pictures/hero.jpg'}
          alt={'Stone Background'}
          className={
            'absolute inset-0 z-0 h-full w-full object-cover brightness-50 animate-fade-in'
          }
        />
        <div className={'z-10 flex flex-grow flex-col gap-10 sm:gap-12'}>
          <div className={'flex gap-4 items-center'}>
            {user?.has_avatar && (
              <UserAvatar
                username={user.username}
                userId={user.id}
                className={'w-24 h-24 animate-fade-in-left max-sm:hidden'}
              />
            )}
            <div>
              {user && (
                <p
                  className={
                    'text-2xl font-bold text-stone-200 sm:text-2xl lg:text-3xl dark:text-stone-300 animate-fade-in-left delay-100'
                  }>
                  Good {getCurrentTimeSection()}!
                </p>
              )}
              <h1
                className={
                  'text-5xl font-black text-stone-50 sm:text-6xl lg:text-7xl dark:text-stone-200 animate-fade-in-left delay-200'
                }>
                {user
                  ? (user.full_name ?? user.username)
                  : 'Explore Infinite Possibilities'}
              </h1>
            </div>
          </div>
          <p
            className={
              'text-xl text-stone-300 md:text-3xl dark:text-stone-300 animate-fade-in-bottom delay-200'
            }>
            <strong>Kosmos </strong> - Your high-performance file hosting
            platform
          </p>
          <div className={'mx-auto mt-auto flex flex-col gap-5 sm:flex-row'}>
            {user ? (
              <>
                <HeroLink
                  className={'animate-fade-in-bottom delay-300'}
                  to={'/home'}
                  icon={<HomeIcon className={'h-8 w-8'} />}>
                  Dashboard
                </HeroLink>
                <HeroLink
                  className={'animate-fade-in-bottom delay-400'}
                  to={'/home/quick'}
                  icon={<ClockIcon className={'h-8 w-8'} />}>
                  Quick Share
                </HeroLink>
              </>
            ) : (
              <HeroLink
                className={'animate-fade-in-bottom delay-300'}
                to={'/auth/login'}
                icon={<ArrowRightEndOnRectangleIcon className={'h-8 w-8'} />}>
                Login
              </HeroLink>
            )}
            {ALLOW_REGISTER && !user && (
              <HeroLink
                className={'animate-fade-in-bottom delay-400'}
                to={'/auth/register'}
                icon={<ArrowRightEndOnRectangleIcon className={'h-8 w-8'} />}>
                Register
              </HeroLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
