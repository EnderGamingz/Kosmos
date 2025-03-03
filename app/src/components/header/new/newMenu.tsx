import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import {
  FileUpload,
  FileUploadModal,
} from '@pages/explorer/components/upload/fileUpload.tsx';
import { CreateFolder } from '@pages/explorer/folder/createFolder.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTopSmall,
} from '@components/defaults/transition.ts';
import { CreateMarkdownFile } from '@components/header/new/createMarkdownFile.tsx';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useDisclosure from '@hooks/useDisclosure.ts';

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const handleClose = () => setOpen(false);

  const uploadDisclosure = useDisclosure();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className={'flex items-center gap-1 p-2'}>
            <PlusIcon className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
            <span className={'text-md text-md hidden sm:inline'}>New</span>
          </button>
        </PopoverTrigger>
        <PopoverContent side={'bottom'} className={'max-w-52 p-3'}>
          <motion.div
            variants={containerVariant()}
            initial={'hidden'}
            animate={'show'}
            className={'space-y-1'}>
            <div className={'flex items-center gap-1'}>
              <div className={'flex-1'}>
                <FileUpload
                  onClick={() => {
                    handleClose();
                    uploadDisclosure.onOpen();
                  }}
                />
              </div>
              <motion.div variants={itemTransitionVariantFadeInFromTopSmall}>
                <Link
                  title={'Quick Share'}
                  to={'/home/quick'}
                  onClick={handleClose}
                  className={'menu-button py-2'}>
                  <ClockIcon className={'h-5 w-5'} />
                </Link>
              </motion.div>
            </div>
            <CreateFolder onClose={handleClose} folder={currentFolder} />
            <CreateMarkdownFile folder={currentFolder} onClose={handleClose} />
          </motion.div>
        </PopoverContent>
      </Popover>
      <FileUploadModal
        open={uploadDisclosure.isOpen}
        onOpenChange={uploadDisclosure.onOpenChange}
      />
    </>
  );
}
