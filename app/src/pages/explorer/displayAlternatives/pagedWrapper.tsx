import { ViewSettings } from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { ReactNode } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { cn } from '@lib/utils.ts';

export function PagedWrapper({
  viewSettings,
  children,
  height,
}: {
  height?: boolean;
  viewSettings?: ViewSettings;
  children: ReactNode;
}) {
  if (!viewSettings?.paged) return children;
  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={viewSettings.onLoadNextPage || (() => {})}
      hasMore={viewSettings.hasNextPage}
      useWindow={false}
      threshold={500}
      className={cn(Boolean(height) && 'h-full')}
      loader={
        <div className={'p-1 text-center text-sm text-stone-600'} key={0}>
          Loading ...
        </div>
      }>
      {children}
    </InfiniteScroll>
  );
}
