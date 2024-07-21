import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { Link } from 'react-router-dom';
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { ALLOW_REGISTER } from '@lib/env.ts';

export function Hero() {
  return (
    <div
      className={'flex min-h-[50vh] p-5 sm:min-h-[calc(100dvh-90px)] sm:p-10'}>
      <motion.div
        initial={{ borderRadius: '0.5rem' }}
        animate={{ borderRadius: '3rem' }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={tw(
          'relative flex-grow overflow-hidden rounded-[3rem] bg-stone-900 shadow-2xl',
          'grid p-5 sm:p-10 md:p-16 lg:p-24',
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
            'z-10 flex flex-grow flex-col gap-6 text-center sm:gap-12'
          }>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={
              'text-5xl font-black text-stone-50 sm:text-6xl lg:text-7xl'
            }>
            Explore Infinite Possibilities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={'text-xl text-stone-100 md:text-3xl lg:text-4xl'}>
            Kosmos - Your high-performance file hosting platform
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className={'mx-auto mt-auto flex flex-col gap-5 sm:flex-row'}>
            <Link
              to={'/auth/login'}
              className={tw(
                'flex items-center gap-2 rounded-full bg-stone-50 px-6 py-2 font-medium text-stone-900 sm:px-10 sm:py-4',
                'text-lg transition-colors hover:bg-stone-300 sm:text-2xl ',
              )}>
              <ArrowRightEndOnRectangleIcon className={'h-8 w-8'} /> Login
            </Link>
            {ALLOW_REGISTER && (
              <Link
                to={'/auth/register'}
                className={tw(
                  'flex items-center gap-2 rounded-full bg-stone-600 px-6 py-2 font-medium text-stone-50 sm:px-10 sm:py-4',
                  'text-lg transition-colors hover:bg-stone-800 sm:text-2xl ',
                )}>
                <ArrowRightEndOnRectangleIcon className={'h-8 w-8'} /> Register
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}