import { useState } from 'react';
import {
  FileUpload,
  FileUploadModal,
} from '@pages/explorer/components/upload/fileUpload.tsx';
import { CreateFolder } from '@pages/explorer/folder/createFolder.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { CreateMarkdownFile } from '@components/header/new/createMarkdownFile.tsx';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useDisclosure from '@hooks/useDisclosure.ts';
import { Clock, Plus } from 'lucide-react';

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const handleClose = () => setOpen(false);

  const uploadDisclosure = useDisclosure();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={'flex items-center gap-1 py-2.5 px-2.5 cursor-pointer'}>
            <Plus className={'h-5 w-5 sm:mr-1'} />
            <span className={'text-md text-md hidden sm:inline'}>New</span>
          </button>
        </PopoverTrigger>
        <PopoverContent side={'bottom'} className={'max-w-60 p-3'}>
          <div className={'space-y-1'}>
            <div className={'flex items-center gap-1'}>
              <div className={'flex-1 animate-fade-in-top'}>
                <FileUpload
                  onClick={() => {
                    handleClose();
                    uploadDisclosure.onOpen();
                  }}
                />
              </div>
              <Link
                title={'Quick Share'}
                to={'/home/quick'}
                onClick={handleClose}
                className={'menu-button py-2 animate-fade-in-top delay-75'}>
                <Clock className={'h-5 w-5'} />
              </Link>
            </div>
            <div className={'animate-fade-in-top delay-100'}>
              <CreateFolder onClose={handleClose} folder={currentFolder} />
            </div>
            <div className={'animate-fade-in-top delay-200'}>
              <CreateMarkdownFile
                folder={currentFolder}
                onClose={handleClose}
              />
            </div>
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
