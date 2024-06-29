import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useUsage } from '@lib/query.ts';
import { Modal, ModalContent, ModalHeader } from '@nextui-org/react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';
import { itemTransitionVariantFadeInFromTopSmall } from '@components/transition.ts';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';

export function FileUploadModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (x: boolean) => void;
}) {
  const currentFolder = useExplorerStore(s => s.current.folder);

  return (
    <Modal
      backdrop={'blur'}
      size={'2xl'}
      isOpen={open}
      onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>File Upload</ModalHeader>
        <FileUploadContent
          folder={currentFolder}
          onClose={() => onOpenChange(false)}
        />
      </ModalContent>
    </Modal>
  );
}

export function FileUpload({ onClick }: { onClick: () => void }) {
  const { data } = useUsage();
  const full = (data?.limit || 0) - (data?.total || 0) <= 0;
  return (
    <motion.button
      variants={itemTransitionVariantFadeInFromTopSmall}
      className={tw('w-full py-3', full ? 'btn-white' : 'btn-black')}
      onClick={onClick}>
      <ArrowUpTrayIcon />
      <div className={'flex flex-col text-start'}>
        Upload Files
        {full && (
          <p className={'w-full text-xs font-medium text-red-400'}>
            Storage limit reached
          </p>
        )}
      </div>
    </motion.button>
  );
}
