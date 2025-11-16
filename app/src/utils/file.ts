import { useSearchParams } from 'react-router-dom';

export default function useSelectFile() {
  const [_, setParams] = useSearchParams();
  return (fileId: string) => {
    setParams(prev => {
      prev.set('f', fileId);
      return prev;
    });
  };
}
