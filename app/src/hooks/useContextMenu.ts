import { useState } from 'react';
import { FileModel, OperationType } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';

const useContextMenu = () => {
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [type, setType] = useState<OperationType>('file');
  const [data, setData] = useState<FileModel | FolderModel | undefined>(
    undefined,
  );

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
