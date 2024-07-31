import { createContext } from 'react';
import { ContextData } from '@hooks/useContextMenu.ts';
import { FolderModel } from '@models/folder.ts';
import { DataOperationType, FileModel } from '@models/file.ts';
import { Vec2 } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper';
import {
  OverwriteDisplay,
  ViewSettings,
} from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';

export type DisplayContextType = {
  viewSettings?: ViewSettings;
  overwriteDisplay?: OverwriteDisplay;
  handleContext: (pos: Vec2, data?: ContextData) => void;
  files: FileModel[];
  folders: FolderModel[];
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
