import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect, useMemo, useState } from 'react';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayHandler } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { FileDisplayActions } from '@pages/explorer/file/display/fileDisplayActions.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import { useSearchState } from '@stores/searchStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { useArrowKeys } from '@utils/registers/arrowKeys.ts';
import {
  CleanDialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@lib/utils.ts';

export default function FileDisplay({
  fileIndex,
  onSelect,
  selected,
  shareUuid,
}: {
  fileIndex?: number;
  onSelect: (file: FileModelDTO) => void;
  selected: FileModelDTO[];
  shareUuid?: string;
}) {
  const [scopedIndex, setScopedIndex] = useState(fileIndex ?? -1);
  const { setFile, currentFolder, filesInScope } = useExplorerStore(
    useShallow(s => ({
      setFile: s.current.selectCurrentFile,
      currentFolder: s.current.folder,
      filesInScope: s.current.filesInScope,
    })),
  );

  const sort = useSearchState(s => s.sort);

  const close = () => {
    setScopedIndex(-1);
    setFile(undefined);
  };

  const disabled = scopedIndex === -1;

  useArrowKeys({
    left: () => {
      if (disabled) return;
      setScopedIndex(prev => {
        if (prev - 1 < 0) {
          close();
          return -1;
        }
        return prev - 1;
      });
    },
    right: () => {
      if (disabled) return;
      setScopedIndex(prev => {
        if (prev + 1 > filesInScope.length) {
          close();
          return -1;
        }
        return prev + 1;
      });
    },
    deps: [filesInScope.length, disabled],
  });

  useEffect(() => {
    if (fileIndex === undefined) close();
    else setScopedIndex(fileIndex !== -1 ? fileIndex : -1);
  }, [fileIndex]);

  useEffect(close, [currentFolder]);

  const file = useMemo(() => {
    if (scopedIndex === -1) return undefined;
    if (filesInScope?.[scopedIndex] === undefined) return undefined;
    return filesInScope[scopedIndex];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, scopedIndex, sort]);

  const isSelected = !!file && selected.includes(file);

  return (
    <FileDisplayContent
      file={file}
      isSelected={isSelected}
      onSelect={onSelect}
      onClose={close}
      shareUuid={shareUuid}
    />
  );
}

function FileDisplayContent({
  file,
  onClose,
  onSelect,
  isSelected,
  shareUuid,
}: {
  file?: FileModelDTO;
  onClose: () => void;
  onSelect: (file: FileModelDTO) => void;
  isSelected: boolean;
  shareUuid?: string;
}) {
  const [prevFile, setPrevFile] = useState<FileModelDTO | undefined>(undefined);
  const [fullsScreenPreview, setFullsScreenPreview] = useState(false);

  useEffect(() => {
    if (file) setPrevFile(file);
  }, [file]);

  return (
    <Dialog open={!!file} onOpenChange={b => !b && onClose()}>
      <CleanDialogContent
        className={
          'flex flex-col h-full w-full max-w-5xl focus:outline-none focus-visible:outline-none md:grid md:max-h-[600px] md:grid-cols-2'
        }>
        <DialogHeader className={'sr-only'}>
          <DialogTitle>{prevFile?.file_name || 'File'}</DialogTitle>
          <DialogDescription>{prevFile?.mime_type || ''}</DialogDescription>
        </DialogHeader>
        {prevFile && (
          <>
            <div
              className={cn(
                '-mb-5 flex-grow md:-mr-5 md:mb-0 [&>*]:absolute [&>*]:inset-0 relative',
              )}>
              <FileDisplayHandler
                file={prevFile}
                fullScreen={fullsScreenPreview}
                onFullScreen={setFullsScreenPreview}
                shareUuid={shareUuid}
              />
            </div>
            <div
              className={cn(
                'relative shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
                'z-10 flex w-full flex-col space-y-5 transition-all',
                'whitespace-nowrap rounded-xl max-md:rounded-b-none bg-gray-50 p-3 md:p-6',
                'max-sm:min-h-1/2 md:outline-2 -outline-offset-2 outline-transparent',
                'dark:bg-stone-900 dark:outline-stone-400/20',
                isSelected &&
                  '-outline-offset-4 outline-blue-500 dark:outline-blue-400',
              )}>
              <DisplayHeader
                file={prevFile}
                selected={isSelected}
                onSelect={onSelect}
              />
              {/**
               * Disabled for now as the favorite changes, the file order
               * and file display currently relies on scope index which changes
               !shareUuid && (
               <FileDisplayFavorite file={file} onUpdate={onUpdate} />
               )**/}
              <FileDisplayStats file={prevFile} />
              <FileDisplayActions
                shareUuid={shareUuid}
                file={prevFile}
                onClose={onClose}
              />
              <FileDisplayFooter file={prevFile} onClose={onClose} />
            </div>
          </>
        )}
      </CleanDialogContent>
    </Dialog>
  );
}
