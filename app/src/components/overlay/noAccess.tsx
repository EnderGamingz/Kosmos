import { Link, useLocation } from 'react-router-dom';
import { cn } from '@lib/utils.ts';
import { buttonVariants } from '@components/ui/button.tsx';
import { ChevronLeft, Key, OctagonAlert } from 'lucide-react';

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
  const { pathname } = useLocation();
  const noAccessText = `You dont have access to ${page ? `the ${page}` : 'this'} page.`;
  const noAccessSubText = isLoggedIn
    ? 'Please return to the previous page'
    : 'Login to continue.';
  const loadingText = 'We are checking if you are logged in';
  const loadingSubText = 'Please wait a moment';
  const errorText = 'Something went wrong, please try again later';

  return (
    <div
      className={cn(
        'body-bg absolute inset-0 z-20 !m-0 p-10 text-stone-700',
        'flex flex-col items-center justify-center gap-2',
        'dark:text-stone-300',
      )}>
      <button
        className={
          'mr-auto flex items-center gap-1 animate-fade-in-left delay-300'
        }
        onClick={() => window.history.back()}>
        <ChevronLeft className={'h-4 w-4'} />
        Back
      </button>
      <div className={'my-auto flex flex-col items-center gap-3'}>
        <div
          className={
            'rounded-full bg-stone-500 p-5 text-stone-200 dark:bg-stone-700/50 animate-fade-in'
          }>
          {loading ? (
            <div
              className={'app-loading-indicator h-12 w-12 !border-t-stone-200'}
            />
          ) : error ? (
            <OctagonAlert className={'h-12 w-12'} />
          ) : (
            <Key className={'h-12 w-12'} />
          )}
        </div>
        <p className={'text-center font-medium animate-fade-in-top delay-100'}>
          {loading ? loadingText : error ? errorText : noAccessText}
        </p>
        <p
          className={
            'text-center text-sm font-light animate-fade-in-top delay-200'
          }>
          {loading ? loadingSubText : error ? error : noAccessSubText}
        </p>
      </div>
      {!loading && !error && !isLoggedIn && (
        <div className={'flex w-full animate-fade-in-top delay-400'}>
          <Link
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full max-w-2xl mx-auto',
            )}
            to={
              '/auth/login' + (pathname !== '/' ? `?return=${pathname}` : '')
            }>
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
