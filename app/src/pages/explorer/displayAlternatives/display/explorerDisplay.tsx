import { FileType } from '@models/file.ts';
import {
  ExplorerDisplay,
  isTypeIgnoredForMobile,
  usePreferenceStore,
} from '@stores/preferenceStore.ts';
import { useMemo } from 'react';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import useLayoutOptions from '@hooks/useLayoutOptions.ts';
import { getDisplayComponent } from '@pages/explorer/displayAlternatives/display/getDisplayComponent.tsx';
import { getLoadingComponent } from '@pages/explorer/displayAlternatives/display/getLoadingComponent.tsx';
import type {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/display/types.ts';

import { ExplorerDisplayWrapper } from '@pages/explorer/displayAlternatives/display/explorerDisplayWrapper.tsx';

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
    if (viewSettings?.binView) return ExplorerDisplay.Table;

    const typeToCheck = overwriteDisplay?.displayMode ?? displayType.type;
    if (shouldUseMobileView && !isTypeIgnoredForMobile(typeToCheck))
      return ExplorerDisplay.Mobile;

    if (overwriteDisplay?.displayMode) return overwriteDisplay.displayMode;
    else return displayType.type;
  };
  const loadingComponent = getLoadingComponent(preferences.loading.type);

  const DisplayComponent = getDisplayComponent(
    displayMode(),
    displayType.details,
  );

  if (isLoading)
    return (
      <div className={'animate-fade-in delay-200'}>{loadingComponent}</div>
    );

  return (
    <ExplorerDisplayWrapper
      shareUuid={shareUuid}
      files={files}
      folders={folders}
      viewSettings={viewSettings}
      overwriteDisplay={overwriteDisplay}
    >
      {DisplayComponent}
    </ExplorerDisplayWrapper>
  );
}
