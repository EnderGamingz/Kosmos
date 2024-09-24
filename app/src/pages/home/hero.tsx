import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { Link } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  ClockIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { ALLOW_REGISTER } from '@lib/env.ts';
import { useUserState } from '@stores/userStore.ts';
import { ReactNode } from 'react';

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
      className={tw(
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
    <div
      className={'flex p-5 sm:h-[calc(100dvh-90px)] sm:max-h-[650px] sm:p-10'}>
      <motion.div
        initial={{ borderRadius: '0.5rem' }}
        animate={{ borderRadius: '3rem' }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={tw(
          'relative flex-grow overflow-hidden rounded-[3rem] bg-stone-900 shadow-2xl',
          'grid p-10 md:p-16 lg:p-24',
        )}>
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          src={'/img/pictures/hero.jpg'}
          alt={'Stone Background'}
          className={
            'absolute inset-0 z-0 h-full w-full object-cover brightness-50'
          }
        />
        <div
          className={
            'z-10 flex flex-grow flex-col gap-10 text-center sm:gap-12'
          }>
          <div>
            {user && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={
                  'text-2xl font-bold text-stone-200/80 sm:text-2xl lg:text-3xl dark:text-stone-300/80'
                }>
                Welcome back
              </motion.p>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={
                'text-5xl font-black text-stone-50 sm:text-6xl lg:text-7xl dark:text-stone-200'
              }>
              {user
                ? (user.full_name ?? user.username)
                : 'Explore Infinite Possibilities'}
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={
              'text-xl text-stone-100 md:text-3xl lg:text-4xl dark:text-stone-300'
            }>
            Kosmos - Your high-performance file hosting platform
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className={'mx-auto mt-auto flex flex-col gap-5 sm:flex-row'}>
            {user ? (
              <>
                <HeroLink
                  to={'/home'}
                  icon={<HomeIcon className={'h-8 w-8'} />}>
                  Dashboard
                </HeroLink>

                <HeroLink
                  to={'/home/quick'}
                  icon={<ClockIcon className={'h-8 w-8'} />}>
                  Quick Share
                </HeroLink>
              </>
            ) : (
              <HeroLink
                to={'/auth/login'}
                icon={<ArrowRightEndOnRectangleIcon className={'h-8 w-8'} />}>
                Login
              </HeroLink>
            )}
            {ALLOW_REGISTER && !user && (
              <HeroLink
                to={'/auth/register'}
                icon={<ArrowRightEndOnRectangleIcon className={'h-8 w-8'} />}>
                Register
              </HeroLink>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
