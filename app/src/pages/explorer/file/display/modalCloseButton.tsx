import { Button } from '@components/ui/button.tsx';
import { X } from 'lucide-react';

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant={'secondary'}
      className={'w-full cursor-pointer'}>
      <X className={'h-4 w-4'} /> Close
    </Button>
  );
}
