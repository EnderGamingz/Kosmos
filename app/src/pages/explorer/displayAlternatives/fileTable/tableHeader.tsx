import { useSearchState } from '@stores/searchStore.ts';
import { SortBy, SortOrder } from '@models/sort.ts';
import tw from '@lib/classMerge.ts';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { FolderModel } from '@models/folder.ts';
import { FileModel } from '@models/file.ts';

export function TableHeader({
  files,
  folders,
}: {
  files: FileModel[];
  folders: FolderModel[];
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
      sortOrder = SortOrder.Desc;
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
          <SelectAllCheckBox files={files} folders={folders} />
        </th>
        <th className={'w-full'} onClick={handleSort(SortBy.Name)}>
          Name
          <SortIcon
            desc={
              currentSort.sort_by === SortBy.Name &&
              currentSort.sort_order === SortOrder.Desc
            }
          />
        </th>
        <th
          align={'right'}
          className={'min-w-[100px]'}
          onClick={handleSort(SortBy.FileSize)}>
          Size
          <SortIcon
            desc={
              currentSort.sort_by === SortBy.FileSize &&
              currentSort.sort_order === SortOrder.Desc
            }
          />
        </th>
        <th
          align={'right'}
          className={'min-w-[155px]'}
          onClick={handleSort(SortBy.UpdatedAt)}>
          Modified
          <SortIcon
            desc={
              currentSort.sort_by === SortBy.UpdatedAt &&
              currentSort.sort_order === SortOrder.Desc
            }
          />
        </th>
      </tr>
    </thead>
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
