import { motion } from 'framer-motion';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';

export function ImageFullscreenView({
  open,
  tooLarge,
  onDoubleClick,
  src,
  file,
}: {
  open: boolean;
  tooLarge: boolean;
  onDoubleClick: () => void;
  src: string;
  file: FileModelDTO;
}) {
  return (
    <Dialog open={open && !tooLarge} onOpenChange={b => !b && onDoubleClick()}>
      <DialogContent className={'!max-w-full h-full p-10 rounded-none'}>
        <DialogHeader className={'sr-only'}>
          <DialogTitle>Image Fullscreen Preview</DialogTitle>
          <DialogDescription>{file.file_name}</DialogDescription>
        </DialogHeader>
        <img
          onDoubleClick={onDoubleClick}
          className={'h-full w-full rounded-xl object-contain drop-shadow-lg'}
          src={src}
          alt={file.file_name}
        />
      </DialogContent>
    </Dialog>
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
      className={cn(
        'absolute top-3 z-[110] rounded-full bg-stone-50/70 p-2 backdrop-blur-sm',
        '[&>svg]:h-5 [&>svg]:w-5',
        isFullscreen || noOffset ? 'right-3' : 'right-3 md:right-8',
        '[&>svg]:text-stone-800',
      )}>
      {isFullscreen ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </motion.div>
  );
}
