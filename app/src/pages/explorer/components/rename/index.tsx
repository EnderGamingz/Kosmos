import { DataOperationType } from '@models/file.ts';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { RenameModalContent } from './renameModalContent.tsx';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

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
  const {
    isOpen,
    onOpen,
    onOpenChange,
    onClose: disclosureOnClose,
  } = useDisclosure();

  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <>
      <Modal
        size={'md'}
        backdrop={'blur'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}>
        <ModalContent>
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
        </ModalContent>
      </Modal>
      <button onClick={onOpen}>
        <PencilIcon />
        Rename
      </button>
    </>
  );
}
