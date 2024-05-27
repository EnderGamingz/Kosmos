import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { queryClient } from '../../../lib/query.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useFolderStore } from '../../../stores/folderStore.ts';
import { useDropzone } from 'react-dropzone';
import tw from '../../../lib/classMerge.ts';

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...e.target.files]);
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
        onClose();
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
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['files'],
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <ModalBody>
        <form ref={formRef}>
          <input
            type={'file'}
            name={'file'}
            id={'file'}
            multiple
            className={'hidden'}
            onChange={handleFileChange}
          />
        </form>
        <div
          {...getRootProps()}
          className={tw(
            'hidden h-52 rounded-xl border-4 border-dashed border-gray-400/50 p-4 md:flex',
            'items-center justify-center text-center text-2xl font-bold text-stone-500',
            isDragActive && 'border-blue-400/50 bg-blue-100',
          )}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here</p>
          ) : (
            <p>Drop some files here, or click to select files</p>
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
        <label htmlFor={'file'} className={'btn-black'}>
          Select File(s)
        </label>
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
