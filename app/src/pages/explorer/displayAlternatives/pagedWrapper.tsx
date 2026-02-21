import type { ReactNode } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { cn } from '@lib/utils.ts';
import type { ViewSettings } from '@pages/explorer/displayAlternatives/display/types.ts';
import type { ReactElementType } from 'react-window';
import { Progress } from '@components/ui/progress.tsx';

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
        <Progress
          indeterminate
          className={'absolute bottom-0 h-0.5 animate-fade-in delay-200'}
          aria-label={'Loading more items'}
          indicatorClassName={'bg-primary'}
          key={0}
        />
      }
    >
      {children}
    </InfiniteScroll>
  );
}
