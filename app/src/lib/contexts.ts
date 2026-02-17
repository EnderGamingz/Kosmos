import { createContext } from 'react';
import type { ContextData } from '@hooks/useContextMenu.ts';
import type { DataOperationType } from '@models/file.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import type { ListOnScrollProps } from 'react-window';
import type { Vec2 } from '@/types/vec2.ts';
import type {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/display/types.ts';

export type DisplayContextType = {
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
  handleContext: (pos: Vec2, data?: ContextData) => void;
  files: FileModelDTO[];
  folders: FolderModelDTO[];
  select: {
    rangeStart?: number;
    setRange: (index: number) => void;
  };
  dragMove: {
    dragged?: DataOperationType;
    id?: string;
    setDrag: (dragged: DataOperationType, id: string) => void;
    resetDrag: () => void;
  };
  shareUuid?: string;
  onScroll?: (props: ListOnScrollProps) => void;
};

export const DisplayContext = createContext<DisplayContextType>({
  handleContext: () => {},
  files: [],
  folders: [],
  onScroll: () => {},
  select: {
    setRange: () => {},
  },
  dragMove: {
    setDrag: () => {},
    resetDrag: () => {},
  },
});
