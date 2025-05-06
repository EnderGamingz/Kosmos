import { ExplorerLoading } from '@stores/preferenceStore.ts';
import { FileGridLoading } from '@pages/explorer/displayAlternatives/fileGrid/fileGridLoading.tsx';
import { FileTableLoading } from '@pages/explorer/displayAlternatives/fileTable/fileTableLoading.tsx';

export function getLoadingComponent(id: ExplorerLoading) {
  switch (id) {
    case ExplorerLoading.Grid:
      return <FileGridLoading />;
    case ExplorerLoading.Table:
    default:
      return <FileTableLoading />;
  }
}