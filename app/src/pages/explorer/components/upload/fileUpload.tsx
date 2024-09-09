import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useUsageStats } from '@lib/query.ts';
import {
  Modal,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { motion } from 'framer-motion';
import { itemTransitionVariantFadeInFromTopSmall } from '@components/defaults/transition.ts';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';
import { ReactNode } from 'react';

export function FileUploadModal({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (x: boolean) => void;
  children?: ReactNode;
}) {
  const currentFolder = useExplorerStore(s => s.current.folder);

  return (
    <>
      {children}
      <Modal
        backdrop={'blur'}
        size={'2xl'}
        isOpen={open}
        onOpenChange={onOpenChange}>
        <ModalContent className={'bg-stone-50 dark:bg-stone-800'}>
          <ModalHeader>File Upload</ModalHeader>
          <FileUploadContent
            folder={currentFolder}
            onClose={() => onOpenChange(false)}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

export function FileUpload({ onClick }: { onClick: () => void }) {
  const { data } = useUsageStats();
  const full = (data?.limit || 0) - (data?.total || 0) <= 0;
  return (
    <motion.button
      variants={itemTransitionVariantFadeInFromTopSmall}
      className={'no-pre menu-button w-full py-2'}
      onClick={onClick}>
      <ArrowUpTrayIcon className={'h-5 w-5'} />
      <div className={'flex flex-col text-start'}>
        Upload
        {full && (
          <p className={'w-full text-xs font-medium text-red-400'}>
            Storage limit reached
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function FileUploadButtonControlled({
  onClose: outsideOnClose,
}: {
  onClose: () => void;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <FileUpload onClick={onOpen} />
      <FileUploadModal
        open={isOpen}
        onOpenChange={o => {
          onOpenChange();
          if (!o) outsideOnClose();
        }}
      />
    </>
  );
}
