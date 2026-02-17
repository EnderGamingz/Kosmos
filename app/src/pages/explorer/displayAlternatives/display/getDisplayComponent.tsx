import { type DetailType, ExplorerDisplay } from '@stores/preferenceStore.ts';
import { lazy } from 'react';

const FileTable = lazy(
  () => import('@pages/explorer/displayAlternatives/fileTable/fileTable.tsx'),
);
const MobileList = lazy(
  () => import('@pages/explorer/displayAlternatives/mobileList'),
);
const FileGrid = lazy(
  () => import('@pages/explorer/displayAlternatives/fileGrid/fileGrid.tsx'),
);
const AlbumDisplay = lazy(
  () => import('@pages/explorer/displayAlternatives/album/albumDisplay.tsx'),
);

export function getDisplayComponent(id: ExplorerDisplay, details: DetailType) {
  switch (id) {
    case ExplorerDisplay.Album:
      return <AlbumDisplay />;
    case ExplorerDisplay.DynamicGrid:
      return <FileGrid dynamic details={details} />;
    case ExplorerDisplay.StaticGrid:
      return <FileGrid details={details} />;
    case ExplorerDisplay.Mobile:
      return <MobileList />;
    case ExplorerDisplay.Table:
    default:
      return <FileTable />;
  }
}
