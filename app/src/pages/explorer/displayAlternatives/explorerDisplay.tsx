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
import { useMemo } from 'react';
import FileGrid from '@pages/explorer/displayAlternatives/fileGrid/fileGrid.tsx';

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
    case ExplorerDisplay.DynamicGrid:
      return <FileGrid dynamic details={details} />;
    case ExplorerDisplay.StaticGrid:
      return <FileGrid details={details} />;
    case ExplorerDisplay.Table:
    default:
      return <FileTable />;
  }
}

export default function ExplorerDataDisplay({
  isLoading,
  files,
  folders,
}: {
  isLoading: boolean;
  files: FileModel[];
  folders: FolderModel[];
}) {
  const preferences = usePreferenceStore();

  const displayType = useMemo(() => {
    const isOnlyImages =
      files.length > 0 &&
      files.filter(file => file.file_type === FileType.Image).length ===
        files.length;

    if (isOnlyImages) return preferences.imageOnly;

    return preferences.mixed;
  }, [files, preferences]);

  if (isLoading) return getLoadingComponent(preferences.loading.type);

  return (
    <ExplorerDisplayWrapper files={files} folders={folders}>
      {getDisplayComponent(displayType.type, displayType.details)}
    </ExplorerDisplayWrapper>
  );
}
