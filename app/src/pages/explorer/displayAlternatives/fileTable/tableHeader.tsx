import { useSearchState } from '@stores/searchStore.ts';
import { SortBy } from '@models/sort.ts';

import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { ExplorerSort } from '@pages/explorer/components/sort.tsx';
import { type RefObject, useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { cn } from '@lib/utils.ts';

export function TableHeader({
  files,
  folders,
  ref,
}: {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
  ref?: RefObject<HTMLTableSectionElement | null>;
}) {
  const currentSort = useSearchState(s => s.sort);
  const context = useContext(DisplayContext);

  const noSort = context.viewSettings?.limitedView || !!context.shareUuid;

  return (
    <div ref={ref}>
      <div
        className={cn(
          '[&>div]:p-3 [&>div]:font-bold [&>div]:text-stone-700 dark:[&>div]:text-stone-300',
          'flex',
        )}
      >
        {!context.viewSettings?.noSelect && (
          <div>
            <SelectAllCheckBox files={files} folders={folders} />
          </div>
        )}
        <div className={'w-full min-w-[300px]'}>
          <ExplorerSort
            name={'Name'}
            sort={SortBy.Name}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </div>
        <div className={'min-w-[110px] text-right'}>
          <ExplorerSort
            name={'Size'}
            sort={SortBy.FileSize}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </div>
        <div className={'min-w-[155px] text-right'}>
          <ExplorerSort
            name={context.viewSettings?.binView ? 'Deleted' : 'Modified'}
            sort={SortBy.UpdatedAt}
            disable={noSort}
            currentSortBy={currentSort.sort_by}
            currentOrder={currentSort.sort_order}
          />
        </div>
      </div>
    </div>
  );
}
