import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useUsageStats } from '@lib/query.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { FileUploadContent } from '@pages/explorer/components/upload/fileUploadContent.tsx';
import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import useDisclosure from '@hooks/useDisclosure.ts';

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Upload</DialogTitle>
            <DialogDescription>
              Upload files by selecting them below
            </DialogDescription>
          </DialogHeader>
          <div>
            <FileUploadContent
              folder={currentFolder}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FileUpload({ onClick }: { onClick: () => void }) {
  const { data } = useUsageStats();
  const full = (data?.limit || 0) - (data?.total || 0) <= 0;
  return (
    <button className={'no-pre menu-button w-full py-2'} onClick={onClick}>
      <ArrowUpTrayIcon className={'h-5 w-5'} />
      <div className={'flex flex-col text-start'}>
        Upload
        {full && (
          <p className={'w-full text-xs font-medium text-red-400'}>
            Storage limit reached
          </p>
        )}
      </div>
    </button>
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
