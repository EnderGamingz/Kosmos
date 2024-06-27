import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import {
  invalidateFiles,
  invalidateFolders,
  invalidateUsage,
  useUsage,
} from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useExplorerStore } from '@stores/folderStore.ts';
import { FileWithPath, useDropzone } from 'react-dropzone';
import tw from '@lib/classMerge.ts';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { Collapse } from 'react-collapse';
import { motion } from 'framer-motion';
import { itemTransitionVariantFadeInFromTopSmall } from '@components/transition.ts';

export function FileUploadContent({
  folder,
  onClose,
  isInFileList,
  children,
}: {
  folder?: string;
  onClose?: () => void;
  isInFileList?: boolean;
  children?: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const notification = useNotifications(s => s.actions);

  const [files, setFiles] = useState<File[] | null>(null);
  const [isTryingInvalidFolderUpload, setIsTryingInvalidFolderUpload] =
    useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (!e.target.files.length) return;

      setIsTryingInvalidFolderUpload(false);
      //setFiles([...e.target.files]);
      const files = Array.from(e.target.files);
      setFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!files || !files?.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }

    const uploadId = notification.notify({
      title: 'File upload',
      loading: true,
      description: `${files.length} files`,
      severity: Severity.INFO,
      canDismiss: false,
    });

    if (onClose) onClose();

    await axios
      .postForm(
        `${BASE_URL}auth/file/upload${folder ? `/${folder}` : ''}`,
        formData,
      )
      .then(res => {
        notification.updateNotification(uploadId, {
          timeout: 2000,
          status: 'Complete',
          severity: Severity.SUCCESS,
          canDismiss: true,
        });
        return res.data;
      })
      .catch(err => {
        notification.updateNotification(uploadId, {
          status: 'Failed',
          description: err.response?.data?.error || 'Error',
          severity: Severity.ERROR,
          canDismiss: true,
        });
      });
  };

  useEffect(() => {
    handleUpload().then(async () => {
      setFiles(null);
      formRef.current?.reset();
      invalidateFiles().then();
      invalidateFolders().then();
      invalidateUsage().then();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles.length) return;

      setIsTryingInvalidFolderUpload(false);
      const isPossibleFolderUpload = acceptedFiles
        .map(file => file.path?.split('/').length)
        .some(x => (x || 0) > 1);
      if (isPossibleFolderUpload) {
        if (isInFileList) {
          notification.notify({
            title: 'Folder Upload',
            status: 'Prevented',
            description:
              'Folder upload detected, please use the dedicated button in the upload modal instead',
            severity: Severity.WARN,
          });
        }
        setIsTryingInvalidFolderUpload(true);
        return;
      }

      setFiles(acceptedFiles);
    },
    [isInFileList, notification],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: isInFileList,
    noKeyboard: isInFileList,
  });

  if (isInFileList && children) {
    return (
      <div
        {...getRootProps()}
        className={tw(
          'rounded-lg outline-dashed outline-2 outline-transparent transition-all',
          isDragActive && 'scale-[0.99] bg-blue-300/20 outline-blue-500',
        )}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  return (
    <>
      <ModalBody>
        <Collapse isOpened={isTryingInvalidFolderUpload}>
          <div className={'rounded-lg border border-warning-500 bg-warning-50'}>
            <div className={'p-2'}>
              <b>Possible Folder Upload Detected</b>
              <p>
                It appears you might be attempting to upload a folder using the
                drop zone. <br />
                To make your upload successful, kindly use the button below
                specifically designed for folder uploads.
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
