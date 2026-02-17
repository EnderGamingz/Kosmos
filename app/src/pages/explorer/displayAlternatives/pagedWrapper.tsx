import type { ReactNode } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { cn } from '@lib/utils.ts';
import type { ViewSettings } from '@pages/explorer/displayAlternatives/display/types.ts';
import type { ReactElementType } from 'react-window';

export function PagedWrapper({
  viewSettings,
  children,
  height,
  type,
}: {
  height?: boolean;
  viewSettings?: ViewSettings;
  children: ReactNode;
  type?: ReactElementType;
}) {
  if (!viewSettings?.paged) return children;

  return (
    <InfiniteScroll
      element={type as string}
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
      }
    >
      {children}
    </InfiniteScroll>
  );
}
