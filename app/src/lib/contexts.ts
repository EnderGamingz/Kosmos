import { createContext } from 'react';
import { ContextData } from '@hooks/useContextMenu.ts';
import { FolderModel } from '@models/folder.ts';
import { FileModel } from '@models/file.ts';
import { Vec2 } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper';

export const DisplayContext = createContext<{
  handleContext: (pos: Vec2, data?: ContextData) => void;
  files: FileModel[];
  folders: FolderModel[];
}>({
  handleContext: () => {},
  files: [],
  folders: [],
});
