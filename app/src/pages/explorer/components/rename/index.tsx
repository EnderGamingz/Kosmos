import { DataOperationType } from '@models/file.ts';
import { RenameModalContent } from './renameModalContent.tsx';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import useDisclosure from '@/hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@components/ui/dialog.tsx';

export function RenameAction({
  type,
  id,
  name,
  onClose,
}: {
  type: DataOperationType;
  id: string;
  name: string;
  onClose?: () => void;
}) {
  const { isOpen, onOpenChange, onClose: disclosureOnClose } = useDisclosure();

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <PencilIcon />
        Rename
      </DialogTrigger>
      <DialogContent className={'!max-w-sm'}>
        <RenameModalContent
          renameData={{ type, id, name }}
          onClose={() => {
            disclosureOnClose();
            // Next UI Causes the file display modal to not close properly
            // this is a workaround
            setTimeout(() => {
              onClose?.();
            }, 400);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
