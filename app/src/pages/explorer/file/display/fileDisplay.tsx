import { Backdrop } from '@components/backdrop.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useExplorerStore } from '@stores/folderStore.ts';
import { FileModel } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { useState } from 'react';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayHandler } from '@pages/explorer/file/display/fileDisplayHandler.tsx';
import { FileDisplayAction } from '@pages/explorer/file/display/fileDisplayAction.tsx';

export default function FileDisplay({
  file,
  isSelected,
  onSelect,
}: {
  file?: FileModel;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const setFile = useExplorerStore(s => s.current.selectCurrentFile);
  const close = () => () => setFile(undefined);

  return (
    <AnimatePresence>
      {file && (
        <FileDisplayContent
          file={file}
          isSelected={isSelected}
          onSelect={onSelect}
          onClose={close()}
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
}: {
  file: FileModel;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) {
  const [fullsScreenPreview, setFullsScreenPreview] = useState(false);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none h-full max-h-[800px] w-full max-w-5xl',
          'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2',
        )}>
        <div
          className={
            'pointer-events-auto isolate m-10 grid w-full grid-cols-2'
          }>
          <div
            className={tw(
              '-mr-5 [&>*]:absolute [&>*]:inset-0',
              fullsScreenPreview ? 'z-20' : 'relative z-0',
            )}>
            <FileDisplayHandler
              file={file}
              fullScreen={fullsScreenPreview}
              onFullScreen={setFullsScreenPreview}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: [0, 1], scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={tw(
              'shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
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
            <FileDisplayAction file={file} onClose={onClose} />
            <FileDisplayFooter file={file} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
