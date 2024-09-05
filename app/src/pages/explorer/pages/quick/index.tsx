import { Helmet } from 'react-helmet';
import { useCallback, useState } from 'react';
import { CreateShare } from '@pages/explorer/components/share/create/createShare.tsx';
import { FileWithPath, useDropzone } from 'react-dropzone';
import tw from '@utils/classMerge.ts';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { MAX_QUICK_SHARE_FILES } from '@lib/constants.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { useByteFormatter } from '@utils/fileSize.ts';
import { useMutation } from '@tanstack/react-query';
import { getLocalTimeZone } from '@internationalized/date';
import { quickShareUploadFn } from '@pages/explorer/pages/quick/quickShareUploadFn.ts';
import { QuickShareResult } from '@pages/explorer/pages/quick/quickShareResult.tsx';

export default function QuickSharePage() {
  const [shareUuid, setShareUuid] = useState<string | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles.length) return;

      const newFiles = acceptedFiles.map(file => {
        const usedNames = new Set(files.map(f => f.name));

        let newFileName = file.name;
        let addedPart = 1;

        while (usedNames.has(newFileName)) {
          const fileParts = file.name.split('.');
          const extension = fileParts.pop();
          const fileName = fileParts.join('');

          newFileName = `${fileName}[${addedPart}]${extension ? '.' : ''}${extension}`;
          addedPart++;
        }

        return new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });
      });

      const filesLeft = MAX_QUICK_SHARE_FILES - files.length;

      if (newFiles.length > filesLeft) {
        newFiles.splice(filesLeft);
      }

      setFiles(prev => [...prev, ...newFiles]);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const byteFormatter = useByteFormatter();
  const notifications = useNotifications(s => s.actions);
  const uploadAction = useMutation({
    mutationFn: (data: {
      files: File[];
      password?: string;
      expiresAt?: string;
      limit?: number;
    }) =>
      quickShareUploadFn({
        ...data,
        byteFormatter,
        notifications,
      }),
    onSuccess: data => {
      setFiles([]);
      const id = data?.message;
      if (id) {
        setShareUuid(id);
      }
    },
  });

  return (
    <>
      <Helmet>
        <title>Quick Share</title>
      </Helmet>
      <div
        className={
          'h-full max-h-[calc(100dvh-90px-80px)] space-y-5 overflow-y-auto p-5 md:max-h-[calc(100dvh-90px)]'
        }>
        <div className={'grid gap-2'}>
          <h1 className={'text-3xl font-light'}>Quick Share</h1>
          <p className={'text-sm font-light'}>
            Quickly upload files to share with others
          </p>
        </div>
        <AnimatePresence>
          {shareUuid ? (
            <QuickShareResult
              uuid={shareUuid}
              onReset={() => setShareUuid(undefined)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}>
              <div className={'p-5 lg:col-span-2'}>
                <motion.div
                  layout
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  {...(getRootProps() as any)}
                  className={tw(
                    'flex min-h-52 overflow-hidden rounded-xl border-4 border-dashed border-gray-400/50 p-4',
                    isDragActive && 'border-blue-400/50 bg-blue-50',
                    !files.length && 'items-center justify-center',
                  )}>
                  <input {...getInputProps({ id: 'files' })} />
                  {!files.length && (
                    <p
                      className={
                        'text-center text-2xl font-bold text-stone-500'
                      }>
                      {isDragActive
                        ? 'Release the files here'
                        : 'Drop some files here'}
                    </p>
                  )}
                  {!!files.length && (
                    <motion.ul layout className={'w-full space-y-2'}>
                      {files.map(file => (
                        <FileItem
                          key={file.name}
                          file={file}
                          onRemove={() =>
                            setFiles(prev => prev.filter(f => f !== file))
                          }
                        />
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              </div>
              <div className={'top-0 h-fit max-md:order-first md:sticky'}>
                <CreateShare
                  disabled={!files.length || uploadAction.isPending}
                  quick
                  createButtonText={
                    'Share' + (files.length ? ` (${files.length})` : '')
                  }
                  onCreate={data => {
                    uploadAction.mutate({
                      ...data,
                      expiresAt: data.expiresAt
                        ?.toDate(getLocalTimeZone())
                        .toISOString(),
                      files,
                    });
                  }}
                  dataType={'folder'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function FileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <motion.li
      title={file.name}
      layout
      onClick={e => e.stopPropagation()}
      className={
        'flex w-full items-center gap-2 rounded-md p-1 transition-colors hover:bg-stone-200/50'
      }
      onDoubleClick={onRemove}>
      <DocumentIcon className={'h-5 min-w-5'} />
      <p className={'col-span-2 truncate'}>{file.name}</p>
      <button className={'ml-auto p-1 text-red-500'} onClick={onRemove}>
        <XMarkIcon className={'h-4 w-4'} />
      </button>
    </motion.li>
  );
}
