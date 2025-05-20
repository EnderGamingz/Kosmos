import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { DetailType, ExplorerDisplay } from '@stores/preferenceStore.ts';

export type ViewSettings = {
  /**
   * Disables display sorting
   */
  limitedView?: boolean;
  /**
   * Disable scroll on the whole page for when the display is not contained in a .file-list
   */
  scrollControlMissing?: boolean;
  paged?: boolean;
  onLoadNextPage?: () => void;
  hasNextPage?: boolean;
  /**
   * If the display is for the trash view
   */
  binView?: boolean;
  noSelect?: boolean;
  noDisplay?: boolean;
  isCreateAllowed?: boolean;
  additionalHeightReduction?: number[];
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
