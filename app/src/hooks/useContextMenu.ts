import { useState } from 'react';
import { FileModel, OperationType } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { Selected } from '@pages/explorer/fileTable.tsx';

export type ContextOperationType = OperationType | 'multi';

export type ContextData = FileModel | FolderModel | Selected | undefined;

const useContextMenu = () => {
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
