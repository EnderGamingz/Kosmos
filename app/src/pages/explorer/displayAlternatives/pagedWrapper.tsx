import { type ReactNode, use } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import type { ViewSettings } from '@pages/explorer/displayAlternatives/display/types.ts';
import type { ReactElementType } from 'react-window';
import { Progress } from '@components/ui/progress.tsx';
import { DisplayContext } from '@lib/contexts.ts';

export function PagedWrapper({
  viewSettings,
  children,
  willAutoFetch = true,
  type,
}: {
  willAutoFetch?: boolean;
  viewSettings?: ViewSettings;
  children: ReactNode;
  type?: ReactElementType;
}) {
  const display = use(DisplayContext);

  if (!viewSettings?.paged) return children;

  return (
    <InfiniteScroll
      element={type as string}
      pageStart={0}
      loadMore={
        viewSettings.onLoadNextPage || (() => console.warn('No callback'))
      }
      getScrollParent={
        display.displayRef !== undefined
          ? () => display.displayRef.current
          : undefined
      }
      hasMore={viewSettings.hasNextPage}
      useWindow={false}
      threshold={500}
      loader={
        willAutoFetch ? (
          <Progress
            indeterminate
            className={'absolute bottom-0 h-0.5 animate-fade-in delay-200'}
            aria-label={'Loading more items'}
            indicatorClassName={'bg-primary'}
            key={0}
          />
        ) : (
          <p key={0} className={'text-muted-foreground text-center'}>
            Loading more items...
          </p>
        )
      }
    >
      {children}
    </InfiniteScroll>
  );
}
