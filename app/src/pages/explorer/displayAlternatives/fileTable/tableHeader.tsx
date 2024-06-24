import { useSearchState } from '@stores/searchStore.ts';
import { SortBy } from '@models/sort.ts';

import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { FolderModel } from '@models/folder.ts';
import { FileModel } from '@models/file.ts';
import { ExplorerSort } from '@pages/explorer/components/sort.tsx';

export function TableHeader({
  files,
  folders,
}: {
  files: FileModel[];
  folders: FolderModel[];
}) {
  const currentSort = useSearchState(s => s.sort);

  return (
    <thead>
      <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
        <th>
          <SelectAllCheckBox files={files} folders={folders} />
        </th>
        <th className={'w-full'}>
          <ExplorerSort
            name={'Name'}
            sort={SortBy.Name}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
        <th align={'right'} className={'min-w-[100px]'}>
          <ExplorerSort
            name={'Size'}
            sort={SortBy.FileSize}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
        <th align={'right'} className={'min-w-[155px]'}>
          <ExplorerSort
            name={'Modified'}
            sort={SortBy.UpdatedAt}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
      </tr>
    </thead>
  );
}
