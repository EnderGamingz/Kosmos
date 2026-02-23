import { ExplorerLoading } from '@stores/preferenceStore.ts';
import { FileGridLoading } from '@pages/explorer/displayAlternatives/fileGrid/fileGridLoading.tsx';
import { FileTableLoading } from '@pages/explorer/displayAlternatives/fileTable/fileTableLoading.tsx';

export function getLoadingComponent(id: ExplorerLoading) {
  if (id === ExplorerLoading.Grid)
    return <FileGridLoading key={'grid-loading'} />;

  return <FileTableLoading key={'table-loading'} />;
}
