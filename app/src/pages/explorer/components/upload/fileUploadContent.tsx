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
import { Collapse } from 'react-collapse';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ConflictModal } from '@pages/explorer/components/upload/conflictModal.tsx';
import { useByteFormatter } from '@utils/fileSize.ts';
import { UPLOAD_CHUNK_SIZE } from '@lib/constants.ts';
import { cn } from '@lib/utils.ts';
import { DialogClose, DialogFooter } from '@components/ui/dialog.tsx';
import { Button, buttonVariants } from '@components/ui/button.tsx';
import { X } from 'lucide-react';

export function FileUploadContent({
  folder,
  onClose,
  isInList,
  children,
  className,
  disabled,
}: {
  folder?: string;
  onClose?: () => void;
  isInList?: boolean;
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
        // Checks for leading slashes which are appended by the Windows file explorer
        .map(file => file.path?.replace(/^(\.\/|\/)+/, '').split('/').length)
        .some(x => (x || 0) > 1);

      if (isPossibleFolderUpload) {
        if (isInList) {
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
    [fileNamesRef, isInList, notification],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: isInList,
    noKeyboard: isInList,
  });

  if (disabled) return children;

  if (isInList && children) {
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
          className={cn(
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
      <Collapse isOpened={isTryingInvalidFolderUpload}>
        <div
          className={
            'mb-2 rounded-md border dark:border-amber-400 dark:bg-amber-950/50 dark:text-amber-50 border-amber-400 bg-amber-100 text-amber-900'
          }>
          <div className={'p-2'}>
            <b>
              Possible Folder Upload Detected
              <X
                className={'float-right w-5 h-5'}
                onClick={() => setIsTryingInvalidFolderUpload(false)}
              />
            </b>
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
        className={cn(
          'hidden h-52 rounded-xl border-4 border-dashed border-gray-400/50 p-4 md:flex',
          'items-center justify-center text-center text-2xl font-bold text-stone-500 cursor-pointer',
          isDragActive && 'border-blue-400/50 bg-blue-100',
        )}>
        <input {...getInputProps({ id: 'files' })} />
        {isDragActive ? (
          <p>Release the files here</p>
        ) : (
          <p>Drop some files here</p>
        )}
      </div>
      <DialogFooter
        className={
          'mt-4 flex flex-col-reverse justify-between gap-3 sm:flex-row [&_button,&_label]:cursor-pointer'
        }>
        <DialogClose asChild>
          <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
        <div className={'flex flex-col gap-1 sm:flex-row'}>
          <label htmlFor={'folders'} className={buttonVariants()}>
            <FolderIcon />
            Select Folder
          </label>
          <label htmlFor={'files'} className={buttonVariants()}>
            <DocumentIcon />
            Select Files(s)
          </label>
        </div>
      </DialogFooter>
    </>
  );
}
