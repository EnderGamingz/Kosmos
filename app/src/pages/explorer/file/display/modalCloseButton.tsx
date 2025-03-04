import { XMarkIcon } from '@heroicons/react/24/solid';
import { Button } from '@components/ui/button.tsx';

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant={'secondary'} className={'w-full'}>
      <XMarkIcon className={'h-4 w-4'} /> Close
    </Button>
  );
}
