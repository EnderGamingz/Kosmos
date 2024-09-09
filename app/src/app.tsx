import { Theme, usePreferenceStore } from '@stores/preferenceStore.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/query.ts';
import { NextUIProvider } from '@nextui-org/react';
import LazyRouter from './lazyRouter.tsx';
import { useEffect } from 'react';

export function App() {
  const darkMode = usePreferenceStore(s => s.theme.type === Theme.Dark);

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
      </NextUIProvider>
    </QueryClientProvider>
  );
}
