import type { ReactNode } from 'react';

export default function SubPageTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      className={
        'text-3xl font-semibold text-stone-800 dark:text-stone-200 truncate animate-fade-in-top delay-50'
      }
    >
      {children}
    </h1>
  );
}
