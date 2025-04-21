import { useSearchState } from '@stores/searchStore.ts';
import { getSortString, SortBy, SortOrder } from '@models/sort.ts';
import { ExplorerSort } from '@pages/explorer/components/sort.tsx';
import { cn } from '@lib/utils.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpNarrowWide,
  X,
} from 'lucide-react';

export function FileGridSort() {
  const currentSort = useSearchState(s => s.sort);
  const clear = useSearchState(s => s.actions.reset);

  const sortIcon = () => {
    if (currentSort.sort_order === undefined) {
      return <ArrowUpDown />;
    }
    if (currentSort.sort_order !== SortOrder.Asc) {
      return <ArrowUpNarrowWide />;
    }
    return <ArrowDownNarrowWide />;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={
            'flex items-center gap-1 px-2 text-sm text-stone-500 [&_svg]:h-5 [&_svg]:w-5'
          }>
          {sortIcon()}
          {getSortString(currentSort.sort_by) ?? 'Sort'}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={'bottom'}
        className={cn(
          'max-w-42 p-3 [&>*]:rounded-md [&>*]:px-2 [&>*]:py-1 [&>*]:transition-colors',
          '[&>*:hover]:bg-muted [&>*]:flex [&>*]:items-center [&>*]:justify-between',
        )}>
        <ExplorerSort
          name={'Name'}
          sort={SortBy.Name}
          currentSortBy={currentSort.sort_by}
          currentOrder={currentSort.sort_order}
        />
        <ExplorerSort
          name={'Size'}
          sort={SortBy.FileSize}
          currentSortBy={currentSort.sort_by}
          currentOrder={currentSort.sort_order}
        />
        <ExplorerSort
          name={'Modified'}
          sort={SortBy.UpdatedAt}
          currentSortBy={currentSort.sort_by}
          currentOrder={currentSort.sort_order}
        />
        <hr className={'my-1 border-stone-200 !p-0'} />
        <button onClick={() => clear()} className={'w-full'}>
          Clear
          <X className={'h-3 w-3'} />
        </button>
      </PopoverContent>
    </Popover>
  );
}
