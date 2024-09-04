import { Helmet } from 'react-helmet';
import { useCallback, useState } from 'react';
import { CreateShare } from '@pages/explorer/components/share/create/createShare.tsx';
import { FileWithPath, useDropzone } from 'react-dropzone';
import tw from '@utils/classMerge.ts';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function QuickSharePage() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles.length) return;

      const usedNames = new Set(files.map(f => f.name));

      const newFiles: File[] = [];
      for (const file of acceptedFiles) {
        if (usedNames.has(file.name)) {
          const fileParts = file.name.split('.');
          const extension = fileParts.pop();
          const fileName = fileParts.join('');

          let addedPart = 1;

          while (
            usedNames.has(
              `${fileName}[${addedPart}]${extension ? '.' : ''}${extension}`,
            )
          ) {
            addedPart++;
          }
          const newFileName = `${fileName}[${addedPart}]${extension ? '.' : ''}${extension}`;
          const newFile = new File([file], newFileName, {
            type: file.type,
            lastModified: file.lastModified,
            // @ts-expect-error Does exist
            webkitRelativePath: file.webkitRelativePath,
          });

          newFiles.push(newFile);
        } else {
          newFiles.push(file);
        }
      }

      setFiles(prev => [...prev, ...newFiles]);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div>
      <Helmet>
        <title>Quick Share</title>
      </Helmet>
      <div
        className={
          'h-full max-h-[calc(100dvh-90px-80px)] space-y-5 overflow-y-auto p-5'
        }>
        <div className={'grid gap-2'}>
          <h1 className={'text-3xl font-light'}>Quick Share</h1>
          <p className={'text-sm font-light'}>
            Quickly upload files to share with others
          </p>
        </div>
        <div className={'grid grid-cols-3'}>
          <div className={'col-span-2 p-5'}>
            <motion.div
              layout
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              {...(getRootProps() as any)}
              className={tw(
                'flex max-h-[700px] min-h-52 overflow-y-auto rounded-xl border-4 border-dashed border-gray-400/50 p-4',
                isDragActive && 'border-blue-400/50 bg-blue-50',
                !files.length && 'items-center justify-center',
              )}>
              <input {...getInputProps({ id: 'files' })} />
              {!files.length && (
                <p className={'text-center text-2xl font-bold text-stone-500'}>
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
          <CreateShare
            disabled={!files.length}
            quick
            createButtonText={
              'Share' + (files.length ? ` (${files.length})` : '')
            }
            onCreate={data => {
              console.log(data);
            }}
            dataType={'folder'}
          />
        </div>
      </div>
    </div>
  );
}

function FileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <motion.li
      layout
      onClick={e => e.stopPropagation()}
      className={
        'flex w-full items-center gap-2 rounded-md p-1 transition-colors hover:bg-stone-200/50'
      }
      onDoubleClick={onRemove}>
      <DocumentIcon className={'h-5 w-5'} />

      <p className={'col-span-2'}>{file.name}</p>
      <button className={'ml-auto p-1 text-red-500'} onClick={onRemove}>
        <XMarkIcon className={'h-4 w-4'} />
      </button>
    </motion.li>
  );
}
