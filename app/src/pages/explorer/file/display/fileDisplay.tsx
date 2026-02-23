import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect, useMemo, useState } from 'react';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayHandler } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { FileDisplayActions } from '@pages/explorer/file/display/fileDisplayActions.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import { useSearchState } from '@stores/searchStore.ts';
import { useShallow } from 'zustand/react/shallow';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { useArrowKeys } from '@utils/registers/arrowKeys.ts';
import {
  CleanDialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@lib/utils.ts';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';

export default function FileDisplay({
  onSelect,
  selected,
  shareUuid,
}: {
  onSelect: (file: FileModelDTO) => void;
  selected: FileModelDTO[];
  shareUuid?: string;
}) {
  const [params, setParams] = useSearchParams();
  const [scopedIndex, setScopedIndex] = useState(-1);
  const { currentFolder, filesInScope } = useExplorerStore(
    useShallow(s => ({
      currentFolder: s.current.folder,
      filesInScope: s.current.filesInScope,
    })),
  );

  const sort = useSearchState(s => s.sort);

  const close = () => {
    setScopedIndex(-1);
    setParams(
      prev => {
        prev.delete('f');
        return prev;
      },
      { replace: true },
    );
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: is handled
  useEffect(() => {
    const fileId = params.get('f');
    if (fileId === null && scopedIndex === -1) return;
    if (fileId === null && scopedIndex !== -1) {
      close();
      return;
    }

    const index = filesInScope.findIndex(f => f.id === fileId);
    if (index === -1) {
      close();
      return;
    }
    setScopedIndex(index !== -1 ? index : -1);
  }, [params]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: is handled
  useEffect(() => {
    if (params.get('f') === null) return;
    close();
  }, [currentFolder]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: is handled
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
    setFullsScreenPreview(false);
  }, [file]);

  return (
    <Dialog open={!!file} onOpenChange={b => !b && onClose()}>
      <CleanDialogContent
        className={
          'p-2 flex flex-col h-full w-full max-w-5xl focus:outline-none focus-visible:outline-none md:grid md:max-h-150 md:grid-cols-2'
        }
      >
        <DialogHeader className={'sr-only'}>
          <DialogTitle>{prevFile?.file_name || 'File'}</DialogTitle>
          <DialogDescription>{prevFile?.mime_type || ''}</DialogDescription>
        </DialogHeader>
        <button
          type={'button'}
          onClick={onClose}
          aria-label={'Close'}
          className={
            'md:hidden border absolute top-5 right-5 z-110 rounded-full bg-stone-50/50 p-2 backdrop-blur-sm animate-fade-scale-in dark:bg-stone-900/50'
          }
        >
          <X className={'size-5 text-stone-800 dark:text-stone-200'} />
        </button>
        {prevFile && (
          <>
            <div
              className={cn(
                '-mb-5 grow md:-mr-5 md:mb-0 *:absolute *:inset-0 relative',
              )}
            >
              <FileDisplayHandler
                file={prevFile}
                fullScreen={fullsScreenPreview}
                onFullScreen={setFullsScreenPreview}
                shareUuid={shareUuid}
                key={prevFile.id}
              />
            </div>
            <div
              className={cn(
                'relative shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
                'z-10 flex w-full flex-col space-y-3 transition-all',
                'whitespace-nowrap rounded-md bg-gray-50 p-3 md:p-4',
                'max-sm:min-h-1/2 outline-2 outline-transparent',
                'dark:bg-stone-900 dark:outline-stone-400/20',
                isSelected &&
                  '-outline-offset-2 outline-blue-500 dark:outline-blue-400',
              )}
            >
              <DisplayHeader
                file={prevFile}
                selected={isSelected}
                onSelect={onSelect}
              />
              {/**
               * Disabled for now as the favorite changes, the file order
               * and file display currently rely on scope index which changes
               * !shareUuid && (<FileDisplayFavorite file={file} onUpdate={onUpdate} />)
               **/}
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
