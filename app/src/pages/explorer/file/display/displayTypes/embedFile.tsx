import { FileModel, FileTypeActions } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import FileMarkdownDisplay from '@pages/explorer/file/display/displayTypes/FileMarkdownDisplay.tsx';
import { ReactNode, useState } from 'react';
import { FullscreenToggle } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import { Portal } from 'react-portal';
import tw from '@utils/classMerge.ts';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

export default function EmbedFile({
  file,
  serveUrl,
  isShared,
}: {
  file: FileModel;
  serveUrl: string;
  isShared: boolean;
}) {
  if (FileTypeActions.isMarkdown(file))
    return (
      <FileMarkdownDisplay
        file={file}
        isShared={isShared}
        serveUrl={serveUrl}
      />
    );

  return <FileObjectDisplay file={file} serveUrl={serveUrl} />;
}

export function ObjectFullscreenView({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              'fixed inset-0 z-[100] overflow-y-auto bg-[var(--markdown-bg)] p-10'
            }>
            {children}
            <motion.div
              onClick={onClose}
              className={tw(
                'fixed top-3 z-[110] [&>svg]:h-5 [&>svg]:w-5',
                'text-[var(--markdown-fg)]',
                open ? 'right-3' : 'right-8',
              )}>
              {open ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

function FileObjectDisplay({
  file,
  serveUrl,
}: {
  file: FileModel;
  serveUrl: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  // Using 'object' because iframes seem to be blocked by browsers when loading the files
  const object = (
    <motion.object
      layoutId={`type-${file.id}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={
        'h-full w-full rounded-xl bg-stone-800/20 text-stone-50 shadow-lg backdrop-blur-md'
      }
      title={file.file_name}
      data={serveUrl}
    />
  );
  return (
    <div className={'relative'}>
      <ObjectFullscreenView
        open={fullscreen}
        onClose={() => setFullscreen(false)}>
        {object}
      </ObjectFullscreenView>
      <FullscreenToggle
        isFullscreen={fullscreen}
        toggle={() => setFullscreen(prev => !prev)}
      />
      {object}
    </div>
  );
}
