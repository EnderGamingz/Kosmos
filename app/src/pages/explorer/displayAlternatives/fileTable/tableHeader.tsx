import { useSearchState } from '@stores/searchStore.ts';
import { SortBy } from '@models/sort.ts';

import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { ExplorerSort } from '@pages/explorer/components/sort.tsx';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export function TableHeader({
  files,
  folders,
}: {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
}) {
  const currentSort = useSearchState(s => s.sort);
  const context = useContext(DisplayContext);

  const noSort = context.viewSettings?.limitedView || !!context.shareUuid;

  return (
    <thead>
      <tr
        className={
          '[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700 dark:[&_th]:text-stone-300'
        }>
        {!context.viewSettings?.noSelect && (
          <th>
            <SelectAllCheckBox files={files} folders={folders} />
          </th>
        )}
        <th className={'w-full min-w-[300px]'}>
          <ExplorerSort
            name={'Name'}
            sort={SortBy.Name}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
        <th align={'right'} className={'min-w-[100px]'}>
          <ExplorerSort
            name={'Size'}
            sort={SortBy.FileSize}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
        <th align={'right'} className={'min-w-[155px]'}>
          <ExplorerSort
            name={context.viewSettings?.binView ? 'Deleted' : 'Modified'}
            sort={SortBy.UpdatedAt}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </th>
      </tr>
    </thead>
  );
}
