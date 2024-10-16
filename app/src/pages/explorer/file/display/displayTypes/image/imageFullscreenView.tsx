import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from 'react-portal';
import tw from '@utils/classMerge.ts';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function ImageFullscreenView({
  open,
  tooLarge,
  onDoubleClick,
  src,
  file,
  noOffset,
}: {
  open: boolean;
  tooLarge: boolean;
  onDoubleClick: () => void;
  src: string;
  file: FileModelDTO;
  noOffset?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && !tooLarge && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              'fixed inset-0 z-[100] bg-stone-50 p-10 dark:bg-stone-900'
            }>
            <motion.img
              onDoubleClick={onDoubleClick}
              className={
                'h-full w-full rounded-xl object-contain drop-shadow-lg'
              }
              layoutId={`image-${file.id}`}
              src={src}
              alt={file.file_name}
            />
            <motion.div
              onClick={onDoubleClick}
              className={tw(
                'absolute top-3 z-[110] [&>svg]:h-5 [&>svg]:w-5',
                open || noOffset ? 'right-3' : 'right-8',
              )}>
              {open ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

export function FullscreenToggle({
  isFullscreen,
  toggle,
  noOffset,
}: {
  isFullscreen: boolean;
  toggle: () => void;
  noOffset?: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={toggle}
      className={tw(
        'absolute top-3 z-[110] rounded-full bg-stone-50/70 p-2 backdrop-blur-sm',
        '[&>svg]:h-5 [&>svg]:w-5',
        isFullscreen || noOffset ? 'right-3' : 'right-3 md:right-8',
        '[&>svg]:text-stone-800',
      )}>
      {isFullscreen ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </motion.div>
  );
}
