import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Maximize2, Minimize2 } from 'lucide-react';

export function ImageFullscreenView({
  open,
  tooLarge,
  onDoubleClick,
  src,
  file,
  previewSrc,
}: {
  open: boolean;
  tooLarge: boolean;
  onDoubleClick: () => void;
  src: string;
  file: FileModelDTO;
  previewSrc?: string;
}) {
  return (
    <Dialog open={open && !tooLarge} onOpenChange={b => !b && onDoubleClick()}>
      <DialogContent
        className={'max-w-full! h-full pt-10 sm:p-10 rounded-none'}
      >
        <DialogHeader className={'sr-only'}>
          <DialogTitle>Image Fullscreen Preview</DialogTitle>
          <DialogDescription>{file.file_name}</DialogDescription>
        </DialogHeader>
        <div
          className={
            'overflow-hidden drop-shadow-lg flex justify-center items-center'
          }
        >
          <img
            onDoubleClick={onDoubleClick}
            className={'h-full w-auto rounded-xl max-h-fit'}
            src={src}
            alt={file.file_name}
            style={{
              backgroundImage: previewSrc ? `url(${previewSrc})` : 'none',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          />
        </div>
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
    <button
      type={'button'}
      onClick={toggle}
      className={cn(
        'border absolute top-3 z-110 rounded-full bg-stone-50/50 p-2 backdrop-blur-sm animate-fade-scale-in',
        '[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-stone-800',
        isFullscreen || noOffset
          ? 'max-md:left-3 md:right-3'
          : 'max-md:left-3 md:right-8',
      )}
    >
      {isFullscreen ? <Minimize2 /> : <Maximize2 />}
    </button>
  );
}
