import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { FileUpload, FileUploadModal } from '@pages/explorer/file/fileUpload';
import { CreateFolder } from '@pages/explorer/folder/createFolder';
import { useExplorerStore } from '@stores/folderStore';

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const handleClose = () => setOpen(false);

  const uploadDisclosure = useDisclosure();

  return (
    <>
      <Popover
        isOpen={open}
        onOpenChange={setOpen}
        placement='bottom'
        showArrow={true}>
        <PopoverTrigger>
          <button className={'btn-black px-5'}>
            <PlusIcon className={'mr-2'} />
            New
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className={'space-y-2 px-1 py-2'}>
            <FileUpload
              onClick={() => {
                handleClose();
                uploadDisclosure.onOpen();
              }}
            />
            <CreateFolder onClose={handleClose} folder={currentFolder} />
          </div>
        </PopoverContent>
      </Popover>
      <FileUploadModal
        open={uploadDisclosure.isOpen}
        onOpenChange={uploadDisclosure.onOpenChange}
      />
    </>
  );
}
