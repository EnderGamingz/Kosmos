import { OperationType } from '../../../../../models/file.ts';
import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { DeleteModalContent } from './deleteModalContent.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../../vars.ts';
import { invalidateFiles, invalidateUsage } from '../../../../lib/query.ts';

export function PermanentDeleteAction({
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

export function MoveToTrash({ id }: { id: string }) {
  const trashAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/${id}/bin`),
    onSuccess: () => {
      invalidateFiles().then();
      invalidateUsage().then();
    },
  });
  return <button onClick={() => trashAction.mutate()}>Trash</button>;
}
