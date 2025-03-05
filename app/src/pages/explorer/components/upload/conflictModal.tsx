import {
  ResolveAction,
  UploadFile,
} from '@pages/explorer/components/upload/uploadFile.ts';
import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { cn } from '@lib/utils.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Button } from '@components/ui/button.tsx';
import { Badge } from '@components/ui/badge.tsx';

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

    const modifiedFiles: File[] = [];

    for (const file of files) {
      if (file.resolveAction === ResolveAction.Skip) continue;
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

    if (modifiedFiles.length + noConflict.length === 0) {
      onAbort();
      return;
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
    <Dialog open={!!files.length} onOpenChange={b => !b && onAbort()}>
      <DialogContent className={'!max-w-2xl space-y-2 p-4'}>
        <DialogHeader>
          <DialogTitle className={'flex items-center gap-2'}>
            <ExclamationTriangleIcon className={'h-6 w-6'} />
            File conflicts
          </DialogTitle>
          <DialogDescription>
            {files.length > 1 ? 'Files' : 'A File'} already exist with the same
            name{files.length > 1 && 's'}.
          </DialogDescription>
          <p className={'text-muted-foreground'}>
            Resolved {resolved.length} / {files.length}
          </p>
        </DialogHeader>
        <div className={'max-h-[400px] overflow-y-auto'}>
          <ul className={'divide-y-1'}>
            {files.map((f, i) => (
              <FileConflictItem
                key={`${f.file.name}-${i}`}
                file={f}
                selectAction={a => handleResolve(a, i)}
              />
            ))}
          </ul>
        </div>
        <div className={'flex justify-between gap-2 pt-5'}>
          <div className={'flex flex-wrap gap-2'}>
            {actions.map(a => (
              <Button
                className={'cursor-pointer'}
                variant={'outline'}
                key={a.allName}
                onClick={() => handleAllResolve(a.action)}>
                {a.allName}
              </Button>
            ))}
          </div>
          <Button
            className={'cursor-pointer'}
            onClick={handleSubmit}
            disabled={resolved.length !== files.length || disabled}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
      className={cn(
        'flex flex-col gap-1 py-1 transition-opacity',
        file.resolveAction !== undefined && 'opacity-60',
      )}>
      <p className={'rounded-md bg-stone-700 p-1 text-stone-50'}>
        {file.file.name}
      </p>
      <div
        className={cn(
          'flex flex-wrap gap-2',
          '[&>button]:rounded-lg [&>button]:px-2 [&>button]:py-1 [&>button]:text-center',
          '[&>button]:outline [&>button]:outline-stone-500/20 [&>button]:transition-colors',
        )}>
        {actions.map(a => (
          <Badge
            key={a.name}
            className={cn(
              'cursor-pointer',
              a.action === file.resolveAction && 'bg-stone-700/50',
            )}
            onClick={() => selectAction(a.action)}>
            {a.name}
          </Badge>
        ))}
      </div>
    </li>
  );
}
