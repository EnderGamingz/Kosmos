import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import {
  makeUploadFiles,
  UploadFile,
} from '@pages/explorer/components/upload/uploadFile.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import {
  invalidateFiles,
  invalidateFolders,
  invalidateUsage,
} from '@lib/query.ts';
import { FileWithPath, useDropzone } from 'react-dropzone';
import tw from '@utils/classMerge.ts';
import { ModalBody, ModalFooter } from '@nextui-org/react';
import { Collapse } from 'react-collapse';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ConflictModal } from '@pages/explorer/components/upload/conflictModal.tsx';
import { useByteFormatter } from '@utils/fileSize.ts';
import { UPLOAD_CHUNK_SIZE } from '@lib/constants.ts';

export function FileUploadContent({
  folder,
  onClose,
  isInHeader,
  children,
  className = '',
  disabled,
}: {
  folder?: string;
  onClose?: () => void;
  isInHeader?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const notification = useNotifications(s => s.actions);
  const byteFormatter = useByteFormatter();

  const fileNamesRef = useRef(
    useExplorerStore.getState().current.filesInScope.map(x => x.file_name),
  );

  useEffect(
    () =>
      useExplorerStore.subscribe(
        state =>
          (fileNamesRef.current = state.current.filesInScope.map(
            x => x.file_name,
          )),
      ),
    [],
  );

  const [selectForUpload, setSelectForUpload] = useState<UploadFile[] | null>(
    null,
  );
  const [toUpload, setToUpload] = useState<File[] | null>(null);
  const [isTryingInvalidFolderUpload, setIsTryingInvalidFolderUpload] =
    useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (!e.target.files.length) return;

      setIsTryingInvalidFolderUpload(false);

      const files = Array.from(e.target.files);
      setSelectForUpload(makeUploadFiles(files, fileNamesRef.current));
    }
  };

  const handleUpload = async (chunk: File[], rest: number) => {
    if (!chunk || !chunk?.length) return;

    const formData = new FormData();
    for (const file of chunk) {
      formData.append('file', file);
    }

    const uploadId = notification.notify({
      title: 'File upload',
      loading: true,
      status: `${chunk.length} files${rest > 0 ? ` • ${rest} remaining` : ''}`,
      severity: Severity.INFO,
      canDismiss: false,
    });

    if (onClose) onClose();

    // noinspection JSUnusedGlobalSymbols
    await axios
      .postForm(
        `${BASE_URL}auth/file/upload${folder ? `/${folder}` : ''}`,
        formData,
        {
          onUploadProgress: ({ loaded, total }) => {
            notification.updateNotification(uploadId, {
              description: `${byteFormatter.formatBytes(loaded)} / ${total ? byteFormatter.formatBytes(total) : 'Unknown'}`,
            });
          },
        },
      )
      .then(res => {
        notification.updateNotification(uploadId, {
          timeout: 2000,
          status: 'Complete',
          description: `${chunk.length} files uploaded`,
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

  function handleToUpload(files: File[]) {
    if (!files || !files?.length) {
      setSelectForUpload(null);
      setToUpload(null);
      formRef.current?.reset();
      invalidateFiles().then();
      invalidateFolders().then();
      invalidateUsage().then();
      return;
    }

    const uploadChunk = files.slice(0, UPLOAD_CHUNK_SIZE);
    const rest = files.slice(UPLOAD_CHUNK_SIZE);

    handleUpload(uploadChunk, rest.length).then(() => {
      handleToUpload(rest);
    });
  }

  useEffect(() => {
    if (!toUpload || !toUpload?.length) return;
    handleToUpload(toUpload);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toUpload]);

  useEffect(() => {
    if (!selectForUpload) return;
    const t = selectForUpload.map(i => i.conflict) || [];
    if (t.every(x => !x)) {
      setToUpload(selectForUpload.map(f => f.file));
    }
  }, [selectForUpload]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles.length) return;

      setIsTryingInvalidFolderUpload(false);
      const isPossibleFolderUpload = acceptedFiles
        .map(file => file.path?.split('/').length)
        .some(x => (x || 0) > 1);
      if (isPossibleFolderUpload) {
        if (isInHeader) {
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

      setSelectForUpload(makeUploadFiles(acceptedFiles, fileNamesRef.current));
    },
    [fileNamesRef, isInHeader, notification],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: isInHeader,
    noKeyboard: isInHeader,
  });

  if (disabled) {
    return <>{children}</>;
  }

  if (isInHeader && children) {
    return (
      <>
        <ConflictModal
          initial={selectForUpload || []}
          onAbort={() => setSelectForUpload(null)}
          onSubmit={setToUpload}
          disabled={selectForUpload?.length === toUpload?.length}
        />
        <div
          {...getRootProps()}
          className={tw(
            'rounded-lg outline-dashed outline-2 outline-transparent transition-all !duration-150',
            isDragActive && 'scale-[0.99] bg-blue-300/20 outline-blue-500',
            className,
          )}>
          <input {...getInputProps()} />
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <ConflictModal
        initial={selectForUpload || []}
        onAbort={() => setSelectForUpload(null)}
        onSubmit={setToUpload}
        disabled={selectForUpload?.length === toUpload?.length}
      />
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
      <ModalFooter
        className={'flex flex-col-reverse justify-between gap-3 sm:flex-row'}>
        <button onClick={onClose} className={'btn-white'}>
          Cancel
        </button>
        <div className={'flex flex-col gap-1 sm:flex-row'}>
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
