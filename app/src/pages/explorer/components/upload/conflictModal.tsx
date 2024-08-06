import {
  ResolveAction,
  UploadFile,
} from '@pages/explorer/components/upload/uploadFile.ts';
import { useEffect, useState } from 'react';
import { Modal, ModalContent, ScrollShadow } from '@nextui-org/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';

const actions = [
  {
    name: 'Skip Upload',
    allName: 'Skip all',
    action: ResolveAction.Skip,
  },
  {
    name: 'Replace Original',
    allName: 'Replace all',
    action: ResolveAction.Replace,
  },
  {
    name: 'Upload unique copy',
    allName: 'Make all unique',
    action: ResolveAction.MakeUnique,
  },
];

export function ConflictModal({
  initial,
  onAbort,
  onSubmit,
  disabled,
}: {
  initial: UploadFile[];
  onAbort: () => void;
  onSubmit: (files: File[]) => void;
  disabled: boolean;
}) {
  const [files, setFiles] = useState(initial);
  const [noConflict, setNoConflict] = useState<File[]>([]);

  useEffect(() => {
    setFiles(initial.filter(i => i.conflict));
    setNoConflict(initial.filter(i => !i.conflict).map(f => f.file));
  }, [initial]);

  const handleResolve = (action: ResolveAction, index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].resolveAction = action;
      return newFiles;
    });
  };

  const resolved = files.filter(f => f.resolveAction !== undefined);

  const handleSubmit = () => {
    if (resolved.length !== files.length || disabled) return;

    const skipped = files.filter(f => f.resolveAction === ResolveAction.Skip);

    if (skipped.length) {
      onAbort();
      return;
    }

    const modifiedFiles: File[] = [];

    for (const file of files) {
      if (file.resolveAction === ResolveAction.MakeUnique) {
        const fileParts = file.file.name.split('.');
        const extension = fileParts.pop();
        const fileName = fileParts.join('');
        const addedPart = new Date().getTime().toString().substring(8);
        const newFileName = `${fileName}[${addedPart}]${extension ? '.' : ''}${extension}`;
        const newFile = new File([file.file], newFileName, {
          type: file.file.type,
          lastModified: file.file.lastModified,
          // @ts-expect-error Does exist
          webkitRelativePath: file.file.webkitRelativePath,
        });
        modifiedFiles.push(newFile);
      } else if (file.resolveAction === ResolveAction.Replace) {
        modifiedFiles.push(file.file);
      }
    }
    onSubmit([...modifiedFiles, ...noConflict]);
  };

  const handleAllResolve = (action: ResolveAction) => {
    setFiles(prev => {
      const newFiles = [...prev];
      for (const file of newFiles) {
        file.resolveAction = action;
      }
      return newFiles;
    });
  };

  return (
    <Modal backdrop={'blur'} isOpen={!!files.length} onClose={onAbort}>
      <ModalContent className={'max-w-xl'}>
        <div className={'space-y-2 p-4'}>
          <div
            className={
              'flex flex-col items-start gap-3 sm:flex-row sm:items-center'
            }>
            <h2
              className={
                'flex items-center gap-2 text-2xl font-medium text-stone-700'
              }>
              <ExclamationTriangleIcon className={'h-6 w-6'} />
              File conflicts
            </h2>
            <p className={'text-sm text-stone-600'}>
              Resolved {resolved.length} / {files.length}
            </p>
          </div>
          <span className={'text-stone-500'}>
            {files.length > 1 ? 'Files' : 'A File'} already exist with the same
            name{files.length > 1 && 's'}.
          </span>
          <ScrollShadow className={'max-h-[400px] overflow-y-auto'}>
            <ul className={'divide-y-1'}>
              {files.map((f, i) => (
                <FileConflictItem
                  key={`${f.file.name}-${i}`}
                  file={f}
                  selectAction={a => handleResolve(a, i)}
                />
              ))}
            </ul>
          </ScrollShadow>
          <div className={'flex justify-between gap-2 pt-5'}>
            <div className={'flex flex-wrap gap-2'}>
              {actions.map(a => (
                <button
                  key={a.allName}
                  className={'btn-black btn-sm'}
                  onClick={() => handleAllResolve(a.action)}>
                  {a.allName}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={resolved.length !== files.length || disabled}
              className={'btn-black'}>
              Submit
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function FileConflictItem({
  file,
  selectAction,
}: {
  file: UploadFile;
  selectAction: (action: ResolveAction) => void;
}) {
  return (
    <li
      className={tw(
        'flex flex-col gap-1 py-1 transition-opacity',
        file.resolveAction !== undefined && 'opacity-60',
      )}>
      <p className={'rounded-md bg-stone-700 p-1 text-stone-50'}>
        {file.file.name}
      </p>
      <div
        className={tw(
          'flex flex-wrap gap-2',
          '[&>button]:rounded-lg [&>button]:px-2 [&>button]:py-1 [&>button]:text-center',
          '[&>button]:outline [&>button]:outline-1 [&>button]:outline-stone-500/20 [&>button]:transition-colors',
        )}>
        {actions.map(a => (
          <button
            key={a.name}
            className={tw(a.action === file.resolveAction && 'bg-stone-500/50')}
            onClick={() => selectAction(a.action)}>
            {a.name}
          </button>
        ))}
      </div>
    </li>
  );
}
