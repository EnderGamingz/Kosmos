import { OperationType } from '../../../../../models/file.ts';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { DeleteModalContent } from './deleteModalContent.tsx';

export function DeleteAction({
  type,
  id,
  name,
}: {
  type: OperationType;
  id: string;
  name: string;
}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  return (
    <>
      <Modal
        size={'md'}
        backdrop={'blur'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement={'auto'}>
        <ModalContent>
          <DeleteModalContent
            deleteData={{ type, id, name }}
            onClose={onClose}
          />
        </ModalContent>
      </Modal>
      <button onClick={onOpen}>Delete</button>
    </>
  );
}
