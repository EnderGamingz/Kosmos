import { Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { MoveModalContent } from './moveModalContent.tsx';
import { ContextOperationType } from '@models/file.ts';
import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

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
    files: string[];
    folders: string[];
  };
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
        onOpenChange={onOpenChange}
        placement={'auto'}>
        <ModalContent className={'bg-stone-50 dark:bg-stone-800'}>
          <MoveModalContent
            moveData={{ type, id, name }}
            multiData={multiData}
            parent={current_parent}
            onClose={() => {
              disclosureOnClose();
              setTimeout(() => {
                onClose?.();
              }, 400);
            }}
          />
        </ModalContent>
      </Modal>
      <button onClick={onOpen}>
        <FolderOpenIcon />
        Move
      </button>
    </>
  );
}
