import { Link } from 'react-router-dom';
import { ALLOW_REGISTER } from '@lib/env.ts';
import type { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';
import { LogIn } from 'lucide-react';

function HeroLink({
  to,
  icon,
  children,
  className = '',
}: {
  to: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-lg bg-stone-50 px-6 py-2 font-medium text-stone-900 sm:px-10 sm:py-4',
        'text-lg transition-colors hover:bg-stone-300 sm:text-2xl dark:bg-stone-300 dark:text-stone-800 dark:hover:bg-stone-400',
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function Hero() {
  return (
    <div className={'flex sm:h-[calc(100dvh-90px)] sm:max-h-150'}>
      <div
        className={cn(
          'relative grow overflow-hidden bg-stone-900 shadow-lg',
          'grid p-10 md:p-16 lg:p-24',
        )}
      >
        <img
          src={'/img/pictures/hero.jpg'}
          alt={'Stone Background'}
          className={
            'absolute inset-0 z-0 h-full w-full object-cover brightness-50 animate-fade-in'
          }
        />
        <div className={'z-10 flex grow flex-col gap-10 sm:gap-12'}>
          <div className={'flex gap-4 items-center'}>
            <div>
              <h1
                className={
                  'text-5xl font-black text-stone-50 sm:text-6xl lg:text-7xl dark:text-stone-200 animate-fade-in-left delay-200'
                }
              >
                Explore Infinite Possibilities
              </h1>
            </div>
          </div>
          <p
            className={
              'text-xl text-stone-300 md:text-3xl dark:text-stone-300 animate-fade-in-bottom delay-200'
            }
          >
            <strong>Kosmos </strong> - Your high-performance file hosting
            platform
          </p>
          <div className={'mx-auto mt-auto flex flex-col gap-5 sm:flex-row'}>
            <HeroLink
              className={'animate-fade-in-bottom'}
              to={'/auth/login'}
              icon={<LogIn className={'h-8 w-8'} />}
            >
              Login
            </HeroLink>

            {ALLOW_REGISTER && (
              <HeroLink
                className={'animate-fade-in-bottom'}
                to={'/auth/register'}
              >
                Register
              </HeroLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
