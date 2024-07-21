import { SortBy, SortOrder } from '@models/sort.ts';
import { useSearchState } from '@stores/searchStore.ts';
import tw from '@utils/classMerge.ts';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export function ExplorerSort({
  name,
  sort,
  currentSortBy,
  currentOrder,
  disable,
}: {
  name: string;
  sort: SortBy;
  currentSortBy?: SortBy;
  currentOrder?: SortOrder;
  disable?: boolean;
}) {
  const updateSort = useSearchState(s => s.actions.sort);

  // Return name if sorting is disabled
  if (disable) return <div className={'w-full'}>{name}</div>;

  const handleSort = () => {
    let sortOrder: SortOrder;

    if (currentSortBy === sort) {
      sortOrder =
        currentOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc;
    } else {
      sortOrder = SortOrder.Desc;
    }

    updateSort({
      sort_order: sortOrder,
      sort_by: sort,
    });
  };

  return (
    <div className={'w-full cursor-pointer'} onClick={handleSort}>
      {name}
      <SortIcon
        desc={currentSortBy === sort && currentOrder === SortOrder.Desc}
      />
    </div>
  );
}

function SortIcon({ desc }: { desc: boolean }) {
  return (
    <span
      className={tw(
        'ml-2 inline-block transition-transform',
        desc ? 'rotate-0' : 'rotate-180',
      )}>
      <ChevronUpIcon className={'h-3 w-3'} />
    </span>
  );
}
