import { Checkbox } from '@nextui-org/react';
import { useSearchState } from '@stores/searchStore.ts';
import { SortBy, SortOrder } from '@models/sort.ts';
import tw from '@lib/classMerge.ts';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export function TableHeader({
  isSelected,
  isIndeterminate,
  onValueChange,
}: {
  isSelected: boolean;
  isIndeterminate: boolean;
  onValueChange: () => void;
}) {
  const currentSort = useSearchState(s => s.sort);
  const updateSort = useSearchState(s => s.actions.sort);

  const handleSort = (sort_by: SortBy) => () => {
    let sortOrder: SortOrder;

    if (currentSort.sort_by === sort_by) {
      sortOrder =
        currentSort.sort_order === SortOrder.Asc
          ? SortOrder.Desc
          : SortOrder.Asc;
    } else {
      sortOrder = SortOrder.Asc;
    }

    updateSort({
      sort_order: sortOrder,
      sort_by: sort_by,
    });
  };

  return (
    <thead>
      <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
        <th>
          <Checkbox
            isSelected={isSelected}
            isIndeterminate={isIndeterminate}
            onChange={onValueChange}
          />
        </th>
        <th className={'w-full'} onClick={handleSort(SortBy.Name)}>
          Name
          <SortIcon
            asc={
              currentSort.sort_by === SortBy.Name &&
              currentSort.sort_order === SortOrder.Asc
            }
          />
        </th>
        <th
          align={'right'}
          className={'min-w-[100px]'}
          onClick={handleSort(SortBy.FileSize)}>
          Size
          <SortIcon
            asc={
              currentSort.sort_by === SortBy.FileSize &&
              currentSort.sort_order === SortOrder.Asc
            }
          />
        </th>
        <th
          align={'right'}
          className={'min-w-[155px]'}
          onClick={handleSort(SortBy.UpdatedAt)}>
          Modified
          <SortIcon
            asc={
              currentSort.sort_by === SortBy.UpdatedAt &&
              currentSort.sort_order === SortOrder.Asc
            }
          />
        </th>
      </tr>
    </thead>
  );
}

function SortIcon({ asc }: { asc: boolean }) {
  return (
    <span
      className={tw(
        'ml-2 inline-block transition-transform',
        asc ? 'rotate-0' : 'rotate-180',
      )}>
      <ChevronUpIcon className={'h-3 w-3'} />
    </span>
  );
}
