import { useSearchState } from '@stores/searchStore.ts';
import {
  Bars3BottomLeftIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getSortString, SortBy, SortOrder } from '@models/sort.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import tw from '@lib/classMerge.ts';
import { ExplorerSort } from '@pages/explorer/components/sort.tsx';

export function FileGridSort() {
  const currentSort = useSearchState(s => s.sort);
  const clear = useSearchState(s => s.actions.reset);

  const sortIcon = () => {
    if (currentSort.sort_order === undefined) {
      return <Bars3BottomLeftIcon />;
    }
    if (currentSort.sort_order !== SortOrder.Asc) {
      return <BarsArrowUpIcon />;
    }
    return <BarsArrowDownIcon />;
  };

  return (
    <Popover placement={'bottom'}>
      <PopoverTrigger>
        <button
          className={
            'flex items-center gap-1 px-2 text-sm text-stone-500 [&_svg]:h-5 [&_svg]:w-5'
          }>
          {sortIcon()}
          {getSortString(currentSort.sort_by) ?? 'Sort'}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div
          className={tw(
            'p-1 [&>*]:rounded-lg [&>*]:px-2 [&>*]:py-1 [&>*]:transition-colors',
            '[&>*:hover]:bg-stone-200 [&>*]:flex [&>*]:items-center [&>*]:justify-between',
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
            <XMarkIcon className={'h-3 w-3'} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
