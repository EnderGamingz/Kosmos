import { useEffect, useState } from 'react';
import { OperationType } from '@models/file.ts';

const useContextMenu = () => {
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const [type, setType] = useState<OperationType>('file');

  useEffect(() => {
    const handleClick = () => setClicked(false);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return {
    clicked,
    setClicked,
    pos,
    setPos,
    type,
    setType,
  };
};
export default useContextMenu;
