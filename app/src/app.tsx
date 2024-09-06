import { Theme, usePreferenceStore } from '@stores/preferenceStore.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/query.ts';
import { NextUIProvider } from '@nextui-org/react';
import LazyRouter from './lazyRouter.tsx';
import { useEffect } from 'react';
import { SunIcon } from '@heroicons/react/24/outline';

export function App() {
  const darkMode = usePreferenceStore(s => s.theme.type === Theme.Dark);
  const set = usePreferenceStore(s => s.theme.setType);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider
        className={
          'app-wrapper flex flex-grow flex-col ' + (darkMode ? 'dark' : '')
        }>
        <LazyRouter />
        <button
          className={'fixed bottom-3 right-3 z-[600]'}
          onClick={() => set(darkMode ? Theme.Light : Theme.Dark)}>
          <SunIcon className={'h-5 w-5'} />
        </button>
      </NextUIProvider>
    </QueryClientProvider>
  );
}
