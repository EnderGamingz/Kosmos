import type { DataOperationType } from '@models/file.ts';
import { RenameModalContent } from './renameModalContent.tsx';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import useDisclosure from '@/hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@components/ui/dialog.tsx';
import { Pencil } from 'lucide-react';

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
        <Pencil />
        Rename
      </DialogTrigger>
      <DialogContent className={'!max-w-sm'}>
        <RenameModalContent
          renameData={{ type, id, name }}
          onClose={() => {
            disclosureOnClose();
            onClose?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
