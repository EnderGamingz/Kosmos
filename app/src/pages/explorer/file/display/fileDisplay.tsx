import { Backdrop } from '@components/backdrop.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useExplorerStore } from '@stores/folderStore.ts';
import { FileModel } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { useMemo, useState } from 'react';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayHandler } from '@pages/explorer/file/display/fileDisplayHandler.tsx';
import { FileDisplayAction } from '@pages/explorer/file/display/fileDisplayAction.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { queryClient } from '@lib/query.ts';
import { useSearchState } from '@stores/searchStore.ts';

export default function FileDisplay({
  fileIndex,
  onSelect,
  selected,
}: {
  fileIndex?: number;
  onSelect: (id: string) => void;
  selected: string[];
}) {
  const [update, setUpdate] = useState(0);
  const setFile = useExplorerStore(s => s.current.selectCurrentFile);
  const sort = useSearchState(s => s.sort);
  const currentFolder = useExplorerStore(s => s.current.folder);
  const close = () => () => setFile(undefined);

  const file = useMemo(() => {
    if (fileIndex === undefined) return undefined;
    const files = queryClient.getQueryData([
      'files',
      currentFolder,
      sort,
    ]) as FileModel[];
    return files[fileIndex];
  }, [currentFolder, fileIndex, sort, update]);

  const isSelected = selected.includes(file?.id || '');

  console.log(file);

  return (
    <AnimatePresence>
      {file && (
        <FileDisplayContent
          file={file}
          isSelected={isSelected}
          onSelect={onSelect}
          onClose={close()}
          onUpdate={() => setUpdate(prev => prev + 1)}
        />
      )}
    </AnimatePresence>
  );
}

function FileDisplayFavorite({
  file,
  onUpdate,
}: {
  file: FileModel;
  onUpdate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: [0, 0], scale: 0.5 }}
      className={tw(
        'absolute -right-3 -top-12 rounded-xl bg-[inherit] p-1 shadow-lg md:-top-10',
        '[&_svg]:h-7 [&_svg]:w-7',
      )}>
      <Favorite
        id={file.id}
        type={'file'}
        active={file.favorite}
        iconOnly
        onUpdate={onUpdate}
      />
    </motion.div>
  );
}

function FileDisplayContent({
  file,
  onClose,
  onSelect,
  isSelected,
  onUpdate,
}: {
  file: FileModel;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onUpdate: () => void;
}) {
  const [fullsScreenPreview, setFullsScreenPreview] = useState(false);

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
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: -200 }}
            animate={{ opacity: 1, scale: [1.1, 1], x: 0 }}
            exit={{ opacity: [0, 0], scale: 0.5, x: 200 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className={tw(
              'relative shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
              'z-10 flex w-full flex-col space-y-5 transition-all',
              'whitespace-nowrap rounded-xl bg-gray-50 p-3 md:p-6',
              'outline outline-2 -outline-offset-2 outline-transparent',
              isSelected && '-outline-offset-4 outline-blue-500',
            )}>
            <DisplayHeader
              file={file}
              selected={isSelected}
              onSelect={onSelect}
            />
            <FileDisplayFavorite file={file} onUpdate={onUpdate} />
            <FileDisplayStats file={file} />
            <FileDisplayAction file={file} onClose={onClose} />
            <FileDisplayFooter file={file} onClose={onClose} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
