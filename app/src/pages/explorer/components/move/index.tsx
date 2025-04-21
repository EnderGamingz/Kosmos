import { MoveModalContent } from './moveModalContent.tsx';
import { ContextOperationType } from '@models/file.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@components/ui/dialog.tsx';
import useDisclosure from '@hooks/useDisclosure.ts';
import { FolderOpen } from 'lucide-react';

export function MoveAction({
  type,
  id,
  name,
  current_parent,
  onClose,
  multiData,
}: {
  type: ContextOperationType;
  id?: string;
  name?: string;
  current_parent?: string | null;
  onClose?: () => void;
  multiData?: {
    files: FileModelDTO[];
    folders: FolderModelDTO[];
  };
}) {
  const { isOpen, onOpenChange, onClose: disclosureOnClose } = useDisclosure();
  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <FolderOpen />
        Move
      </DialogTrigger>
      <DialogContent>
        <MoveModalContent
          moveData={{ type, id, name }}
          multiData={multiData}
          parent={current_parent}
          onClose={() => {
            disclosureOnClose();
            onClose?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
