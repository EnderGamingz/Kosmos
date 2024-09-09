import tw from '@utils/classMerge.ts';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ExclamationCircleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export function NoAccess({
  page,
  loading,
  error,
  isLoggedIn,
}: {
  page?: string;
  loading?: boolean;
  error?: string;
  isLoggedIn?: boolean;
}) {
  const noAccessText = `You dont have access to ${page ? `the ${page}` : 'this'} page.`;
  const noAccessSubText = isLoggedIn
    ? 'Please return to the previous page'
    : 'Login to continue.';
  const loadingText = 'We are checking if you are logged in';
  const loadingSubText = 'Please wait a moment';
  const errorText = 'Something went wrong, please try again later';

  return (
    <div
      className={tw(
        'body-bg absolute inset-0 z-20 !m-0 p-10 text-stone-700',
        'flex flex-col items-center justify-center gap-2',
        'dark:text-stone-300',
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
          className={
            'rounded-full bg-stone-500 p-5 text-stone-200 dark:bg-stone-700/50'
          }>
          {loading ? (
            <div
              className={'app-loading-indicator h-12 w-12 !border-t-stone-200'}
            />
          ) : error ? (
            <ExclamationCircleIcon className={'h-12 w-12'} />
          ) : (
            <KeyIcon className={'h-12 w-12'} />
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={'text-center font-medium'}>
          {loading ? loadingText : error ? errorText : noAccessText}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={'text-center text-sm font-light'}>
          {loading ? loadingSubText : error ? error : noAccessSubText}
        </motion.p>
      </div>
      {!loading && !error && !isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={'flex w-full'}>
          <Link
            className={tw(
              'w-full rounded-xl bg-stone-700 p-2 text-center text-lg font-medium text-stone-100',
              'mx-auto max-w-2xl shadow transition-colors hover:bg-stone-500/60 hover:shadow-md',
            )}
            to={'/auth/login'}>
            Login
          </Link>
        </motion.div>
      )}
    </div>
  );
}
