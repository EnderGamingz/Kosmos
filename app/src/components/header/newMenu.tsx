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
} from '@pages/explorer/components/fileUpload.tsx';
import { CreateFolder } from '@pages/explorer/folder/createFolder';
import { useExplorerStore } from '@stores/folderStore';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/transition.ts';

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const handleClose = () => setOpen(false);

  const uploadDisclosure = useDisclosure();

  return (
    <>
      <Popover isOpen={open} onOpenChange={setOpen} placement={'bottom'}>
        <PopoverTrigger>
          <button className={'flex items-center px-2'}>
            <PlusIcon className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
            <span className={'text-md text-md hidden sm:inline'}>New</span>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <motion.div
            variants={containerVariant()}
            initial={'hidden'}
            animate={'show'}
            className={'max-w-52 space-y-2 px-0.5 py-2'}>
            <FileUpload
              onClick={() => {
                handleClose();
                uploadDisclosure.onOpen();
              }}
            />
            <CreateFolder onClose={handleClose} folder={currentFolder} />
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
