import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export function NoAccess({
  page,
  loading,
}: {
  page?: string;
  loading?: boolean;
}) {
  const noAccessText = `You dont have access to ${page ? `the ${page}` : 'this'} page.`;

  return (
    <div
      className={tw(
        'body-bg absolute inset-0 z-20 p-10 text-stone-700',
        'flex flex-col items-center justify-center gap-2',
      )}>
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={'mr-auto flex items-center gap-1'}
        onClick={() => window.history.back()}>
        <ChevronLeftIcon className={'h-4 w-4'} />
        Back
      </motion.button>
      <div className={'my-auto flex flex-col items-center gap-3'}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={'rounded-full bg-stone-500 p-5'}>
          {loading ? (
            <div
              className={'app-loading-indicator h-12 w-12 !border-t-stone-200'}
            />
          ) : (
            <KeyIcon className={'h-12 w-12 text-stone-200'} />
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={'text-center font-medium'}>
          {loading ? 'We are checking if you are logged in' : noAccessText}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={'text-center text-sm font-light'}>
          {loading ? 'Please wait a moment' : 'Login to continue'}
        </motion.p>
      </div>
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={'flex w-full'}>
          <Link
            className={tw(
              'w-full rounded-xl bg-stone-500/50 p-3 text-center text-lg font-medium',
              'shadow transition-colors hover:bg-stone-500/60 hover:shadow-md',
            )}
            to={'/auth/login'}>
            Login
          </Link>
        </motion.div>
      )}
    </div>
  );
}
