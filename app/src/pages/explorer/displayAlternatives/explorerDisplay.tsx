import { FolderModel } from '@models/folder.ts';
import { FileModel, FileType } from '@models/file.ts';
import { FileTableLoading } from '@pages/explorer/displayAlternatives/fileTable/fileTableLoading.tsx';
import { FileTable } from '@pages/explorer/displayAlternatives/fileTable/fileTable.tsx';
import { ExplorerDisplayWrapper } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper.tsx';
import {
  DetailType,
  ExplorerDisplay,
  ExplorerLoading,
  usePreferenceStore,
} from '@stores/preferenceStore.ts';
import { FileGridLoading } from '@pages/explorer/displayAlternatives/fileGrid/fileGridLoading.tsx';
import { useEffect, useMemo, useState } from 'react';
import FileGrid from '@pages/explorer/displayAlternatives/fileGrid/fileGrid.tsx';
import { useSearchState } from '@stores/searchStore.ts';
import objectHash from 'object-hash';
import AlbumDisplay from '@pages/explorer/displayAlternatives/album/albumDisplay.tsx';

function getLoadingComponent(id: ExplorerLoading) {
  switch (id) {
    case ExplorerLoading.Grid:
      return <FileGridLoading />;
    case ExplorerLoading.Table:
    default:
      return <FileTableLoading />;
  }
}

function getDisplayComponent(id: ExplorerDisplay, details: DetailType) {
  switch (id) {
    case ExplorerDisplay.Album:
      return <AlbumDisplay />;
    case ExplorerDisplay.DynamicGrid:
      return <FileGrid dynamic details={details} />;
    case ExplorerDisplay.StaticGrid:
      return <FileGrid details={details} />;
    case ExplorerDisplay.Table:
    default:
      return <FileTable />;
  }
}

export type ViewSettings = {
  limitedView?: boolean;
  scrollControlMissing?: boolean;
  paged?: boolean;
  onLoadNextPage?: () => void;
  hasNextPage?: boolean;
  binView?: boolean;
  noSelect?: boolean;
  noDisplay?: boolean;
  album?: {
    onFileClick?: (file: FileModel) => void;
    albumId?: string;
  };
};

export type OverwriteDisplay = {
  displayMode?: ExplorerDisplay;
  details?: DetailType;
  gridSize?: number;
};

export default function ExplorerDataDisplay({
  isLoading,
  files,
  folders,
  shareUuid,
  viewSettings,
  overwriteDisplay,
}: {
  isLoading: boolean;
  files: FileModel[];
  folders: FolderModel[];
  shareUuid?: string;
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
}) {
  const [prevSort, setPrevSort] = useState('');
  const preferences = usePreferenceStore();
  const sort = useSearchState(s => objectHash(s.sort));

  const displayType = useMemo(() => {
    const isOnlyImages =
      files.length > 0 &&
      files.filter(file => file.file_type === FileType.Image).length ===
        files.length;

    if (isOnlyImages) return preferences.imageOnly;

    return preferences.mixed;
  }, [files, preferences]);

  // Needed because when the query client returns a cached result, framer motion
  // will try to reorder the items which causes issues when too many
  useEffect(() => {
    const t = setTimeout(() => setPrevSort(sort), 1);
    return () => clearTimeout(t);
  }, [sort, displayType]);

  if (isLoading || prevSort !== sort)
    return getLoadingComponent(preferences.loading.type);

  const displayMode = () => {
    if (overwriteDisplay?.displayMode) {
      return overwriteDisplay.displayMode;
    } else if (viewSettings?.binView) {
      return ExplorerDisplay.Table;
    } else {
      return displayType.type;
    }
  };

  return (
    <ExplorerDisplayWrapper
      shareUuid={shareUuid}
      files={files}
      folders={folders}
      viewSettings={viewSettings}
      overwriteDisplay={overwriteDisplay}>
      {getDisplayComponent(displayMode(), displayType.details)}
    </ExplorerDisplayWrapper>
  );
}
