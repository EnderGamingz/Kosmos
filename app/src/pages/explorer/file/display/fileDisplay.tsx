import { Backdrop } from '@components/overlay/backdrop.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useExplorerStore } from '@stores/explorerStore.ts';
import tw from '@utils/classMerge.ts';
import { useEffect, useMemo, useState } from 'react';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayHandler } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { FileDisplayActions } from '@pages/explorer/file/display/fileDisplayActions.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import { useSearchState } from '@stores/searchStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { neutralizeBack, reviveBack } from '@utils/registers/history.ts';
import { useArrowKeys } from '@utils/registers/arrowKeys.ts';

export default function FileDisplay({
  fileIndex,
  onSelect,
  selected,
  shareUuid,
}: {
  fileIndex?: number;
  onSelect: (id: string) => void;
  selected: string[];
  shareUuid?: string;
}) {
  const [scopedIndex, setScopedIndex] = useState(fileIndex ?? -1);
  // const [update, setUpdate] = useState(0);
  const { setFile, currentFolder, filesInScope } = useExplorerStore(
    useShallow(s => ({
      setFile: s.current.selectCurrentFile,
      currentFolder: s.current.folder,
      filesInScope: s.current.filesInScope,
    })),
  );

  const sort = useSearchState(s => s.sort);

  const close = () => () => {
    setScopedIndex(-1);
    setFile(undefined);
  };

  useArrowKeys({
    left: () =>
      setScopedIndex(prev => {
        if (prev - 1 < 0) {
          return -1;
        }
        return prev - 1;
      }),
    right: () =>
      setScopedIndex(prev => {
        if (prev + 1 > filesInScope.length) {
          return filesInScope.length;
        }
        return prev + 1;
      }),
    deps: [filesInScope.length],
  });

  useEffect(() => {
    setScopedIndex(fileIndex ?? -1);
  }, [fileIndex]);

  useEffect(() => {
    setScopedIndex(-1);
  }, [currentFolder]);

  const file = useMemo(() => {
    if (scopedIndex === -1) return undefined;
    if (filesInScope?.[scopedIndex] === undefined) return undefined;
    return filesInScope[scopedIndex];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, scopedIndex, sort /** update **/]);

  const isSelected = selected.includes(file?.id || '');

  return (
    <AnimatePresence>
      {file && (
        <FileDisplayContent
          file={file}
          isSelected={isSelected}
          onSelect={onSelect}
          onClose={close()}
          // onUpdate={() => setUpdate(prev => prev + 1)}
          shareUuid={shareUuid}
        />
      )}
    </AnimatePresence>
  );
}

function FileDisplayContent({
  file,
  onClose,
  onSelect,
  isSelected,
  // onUpdate,
  shareUuid,
}: {
  file: FileModelDTO;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  // onUpdate: () => void;
  shareUuid?: string;
}) {
  const [fullsScreenPreview, setFullsScreenPreview] = useState(false);

  useEffect(() => {
    neutralizeBack(onClose);
    return () => reviveBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none h-full w-full max-w-5xl md:max-h-[600px]',
          'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2',
        )}>
        <div
          className={
            'pointer-events-auto isolate m-4 flex w-full flex-col sm:m-6 md:m-10 md:grid md:grid-cols-2'
          }>
          <div
            className={tw(
              '-mb-5 flex-grow md:-mr-5 md:mb-0 [&>*]:absolute [&>*]:inset-0',
              fullsScreenPreview ? 'z-20' : 'relative z-0',
            )}>
            <motion.div layoutId={`compact-${file.id}`} className={'-z-10'} />
            <FileDisplayHandler
              file={file}
              fullScreen={fullsScreenPreview}
              onFullScreen={setFullsScreenPreview}
              shareUuid={shareUuid}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: [0, 0], scale: 0.5, pointerEvents: 'none' }}
            transition={{ duration: 0.2 }}
            className={tw(
              'relative shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
              'z-10 flex w-full flex-col space-y-5 transition-all',
              'whitespace-nowrap rounded-xl bg-gray-50 p-3 md:p-6',
              'max-sm:min-h-1/2 outline outline-2 -outline-offset-2 outline-transparent',
              'dark:bg-stone-900 dark:outline-stone-400/20',
              isSelected &&
                '-outline-offset-4 outline-blue-500 dark:outline-blue-400',
            )}>
            <DisplayHeader
              file={file}
              selected={isSelected}
              onSelect={onSelect}
            />
            {/**
             * Disabled for now as the favorite changes the file order
             * and file display currently relies on scope index which changes
             !shareUuid && (
             <FileDisplayFavorite file={file} onUpdate={onUpdate} />
             )**/}
            <FileDisplayStats file={file} />
            <FileDisplayActions
              shareUuid={shareUuid}
              file={file}
              onClose={onClose}
            />
            <FileDisplayFooter file={file} onClose={onClose} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
