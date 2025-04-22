import { FileType } from '@models/file.ts';
import { FileTableLoading } from '@pages/explorer/displayAlternatives/fileTable/fileTableLoading.tsx';
import { FileTable } from '@pages/explorer/displayAlternatives/fileTable/fileTable.tsx';
import { ExplorerDisplayWrapper } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper.tsx';
import {
  DetailType,
  ExplorerDisplay,
  ExplorerLoading,
  isTypeIgnoredForMobile,
  usePreferenceStore,
} from '@stores/preferenceStore.ts';
import { FileGridLoading } from '@pages/explorer/displayAlternatives/fileGrid/fileGridLoading.tsx';
import { useMemo } from 'react';
import FileGrid from '@pages/explorer/displayAlternatives/fileGrid/fileGrid.tsx';
import AlbumDisplay from '@pages/explorer/displayAlternatives/album/albumDisplay.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import useLayoutOptions from '@hooks/useLayoutOptions.ts';
import { MobileList } from './mobileList';

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
    case ExplorerDisplay.Mobile:
      return <MobileList />;
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
  isCreateAllowed?: boolean;
  noActions?: boolean;
  selectDisable?: {
    files?: boolean;
    folders?: boolean;
  };
  handleOverwrites?: {
    onFolderClick?: (id: string) => void;
  };
  album?: {
    onFileClick?: (index: number) => void;
    data?: AlbumModelDTO;
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
  files: FileModelDTO[];
  folders: FolderModelDTO[];
  shareUuid?: string;
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
}) {
  const preferences = usePreferenceStore();
  const shouldUseMobileView = useLayoutOptions().shouldUseMobileView;

  const displayType = useMemo(() => {
    const isOnlyImages =
      files.length > 0 &&
      files.filter(file => file.file_type === FileType.Image).length ===
        files.length;

    if (isOnlyImages) return preferences.imageOnly;

    return preferences.mixed;
  }, [files, preferences]);

  const displayMode = () => {
    if (shouldUseMobileView && isTypeIgnoredForMobile(displayType.type))
      return ExplorerDisplay.Mobile;
    if (overwriteDisplay?.displayMode) return overwriteDisplay.displayMode;
    else if (viewSettings?.binView) return ExplorerDisplay.Table;
    else return displayType.type;
  };

  if (isLoading) return getLoadingComponent(preferences.loading.type);

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
