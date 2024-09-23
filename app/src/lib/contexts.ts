import { createContext } from 'react';
import { ContextData } from '@hooks/useContextMenu.ts';
import { DataOperationType } from '@models/file.ts';
import { Vec2 } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper';
import {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

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
};

export const DisplayContext = createContext<DisplayContextType>({
  handleContext: () => {},
  files: [],
  folders: [],
  select: {
    setRange: () => {},
  },
  dragMove: {
    setDrag: () => {},
    resetDrag: () => {},
  },
});
