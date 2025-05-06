import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { DetailType, ExplorerDisplay } from '@stores/preferenceStore.ts';

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
