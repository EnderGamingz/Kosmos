import { createContext } from 'react';
import { ContextData } from '@hooks/useContextMenu.ts';
import { DataOperationType } from '@models/file.ts';
import {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { ListOnScrollProps } from 'react-window';
import { Vec2 } from '@/types/vec2.ts';

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
