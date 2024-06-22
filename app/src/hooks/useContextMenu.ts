import { useState } from 'react';
import { DataOperationType, FileModel, Selected } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';

export type ContextOperationType = DataOperationType | 'multi';

export type ContextData = FileModel | FolderModel | Selected | undefined;

export type ContextMenuType = {
  setPos: (value: { x: number; y: number }) => void;
  data: ContextData;
  pos: { x: number; y: number };
  setData: (value: ContextData) => void;
  setClicked: (value: boolean) => void;
  type: ContextOperationType;
  setType: (value: ContextOperationType) => void;
  clicked: boolean;
};

const useContextMenu: () => ContextMenuType = () => {
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [type, setType] = useState<ContextOperationType>('file');
  const [data, setData] = useState<ContextData>(undefined);

  return {
    clicked,
    setClicked,
    pos,
    setPos,
    type,
    setType,
    data,
    setData,
  };
};
export default useContextMenu;
