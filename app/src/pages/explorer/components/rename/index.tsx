import { DataOperationType } from '@models/file.ts';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { RenameModalContent } from './renameModalContent.tsx';
import { PencilIcon } from '@heroicons/react/24/outline';

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
