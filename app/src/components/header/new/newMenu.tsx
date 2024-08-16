import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import {
  FileUpload,
  FileUploadModal,
} from '@pages/explorer/components/upload/fileUpload.tsx';
import { CreateFolder } from '@pages/explorer/folder/createFolder.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/defaults/transition.ts';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';
import { CreateMarkdownFile } from '@components/header/new/createMarkdownFile.tsx';

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const handleClose = () => setOpen(false);

  const uploadDisclosure = useDisclosure();

  return (
    <>
      <Popover isOpen={open} onOpenChange={setOpen} placement={'bottom'}>
        <PopoverTrigger>
          <button>
            <FileUploadContent folder={currentFolder} isInHeader={true}>
              <PlusIcon className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
              <span className={'text-md text-md hidden sm:inline'}>New</span>
            </FileUploadContent>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <motion.div
            variants={containerVariant()}
            initial={'hidden'}
            animate={'show'}
            className={'max-w-52 space-y-1 px-0.5 py-2'}>
            <FileUpload
              onClick={() => {
                handleClose();
                uploadDisclosure.onOpen();
              }}
            />
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
