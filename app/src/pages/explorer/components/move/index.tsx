import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { MoveModalContent } from './moveModalContent.tsx';
import { OperationType } from '../../../../../models/file.ts';

export function MoveAction({
  type,
  id,
  name,
  current_parent,
}: {
  type: OperationType;
  id: string;
  name: string;
  current_parent?: string;
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
          <MoveModalContent
            moveData={{ type, id, name }}
            parent={current_parent}
            onClose={onClose}
          />
        </ModalContent>
      </Modal>
      <button onClick={onOpen}>Move</button>
    </>
  );
}
