import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { invalidateFiles, invalidateUsage } from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useFolderStore } from '@stores/folderStore.ts';
import { FileWithPath, useDropzone } from 'react-dropzone';
import tw from '@lib/classMerge.ts';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { Collapse } from 'react-collapse';

function FileUploadContent({
  folder,
  onClose,
}: {
  folder?: string;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const notification = useNotifications(s => s.actions);

  const [files, setFiles] = useState<File[] | null>(null);
  const [isTryingInvalidFolderUpload, setIsTryingInvalidFolderUpload] =
    useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsTryingInvalidFolderUpload(false);
      //setFiles([...e.target.files]);
      const files = Array.from(e.target.files);
      setFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }

    const uploadId = notification.notify({
      title: 'File upload',
      loading: true,
      description: `${files.length} files`,
      severity: Severity.INFO,
    });

    onClose();

    await axios
      .postForm(
        `${BASE_URL}auth/file/upload${folder ? `/${folder}` : ''}`,
        formData,
      )
      .then(res => {
        notification.updateNotification(uploadId, {
          timeout: 2000,
          status: 'Upload complete',
          severity: Severity.SUCCESS,
        });
        return res.data;
      })
      .catch(() => {
        notification.updateNotification(uploadId, {
          status: 'Upload failed',
          severity: Severity.ERROR,
        });
      });
  };

  useEffect(() => {
    handleUpload().then(async () => {
      setFiles(null);
      formRef.current?.reset();
      invalidateFiles().then();
      invalidateUsage().then();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setIsTryingInvalidFolderUpload(false);
    const isPossibleFolderUpload = acceptedFiles
      .map(file => file.path?.split('/').length)
      .some(x => (x || 0) > 1);
    if (isPossibleFolderUpload) {
      setIsTryingInvalidFolderUpload(true);
      return;
    }

    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <>
      <ModalBody>
        <Collapse isOpened={isTryingInvalidFolderUpload}>
          <div className={'rounded-lg border border-warning-500 bg-warning-50'}>
            <div className={'p-2'}>
              <b>Possible invalid upload</b>
              <p>
                It seems like you are trying to upload a folder through the drop
                zone. <br />
                Please only use the button below to upload folders.
              </p>
            </div>
          </div>
        </Collapse>
        <form ref={formRef}>
          <input
            hidden
            type={'file'}
            name={'folders'}
            id={'folders'}
            className={'hidden'}
            onChange={handleFileChange}
            multiple
            // @ts-expect-error Directory is expected
            directory={''}
            webkitdirectory={''}
            mozdirectory={''}
          />
        </form>
        <div
          {...getRootProps()}
          className={tw(
            'hidden h-52 rounded-xl border-4 border-dashed border-gray-400/50 p-4 md:flex',
            'items-center justify-center text-center text-2xl font-bold text-stone-500',
            isDragActive && 'border-blue-400/50 bg-blue-100',
          )}>
          <input {...getInputProps({ id: 'files' })} />
          {isDragActive ? (
            <p>Release the files here</p>
          ) : (
            <p>Drop some files here</p>
          )}
        </div>
      </ModalBody>
      <ModalFooter className={'flex justify-between'}>
        <button
          onClick={onClose}
          className={
            'rounded-md px-3 py-1 text-slate-600 outline outline-1 outline-slate-600'
          }>
          Cancel
        </button>
        <div className={'flex gap-1'}>
          <label htmlFor={'folders'} className={'btn-black'}>
            <FolderIcon />
            Select Folder
          </label>
          <label htmlFor={'files'} className={'btn-black'}>
            <DocumentIcon />
            Select Files(s)
          </label>
        </div>
      </ModalFooter>
    </>
  );
}

export function FileUploadModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (x: boolean) => void;
}) {
  const currentFolder = useFolderStore(s => s.selectedFolder);

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
  return (
    <button className={'btn-black w-full py-3'} onClick={onClick}>
      <ArrowUpTrayIcon /> Upload Files
    </button>
  );
}
