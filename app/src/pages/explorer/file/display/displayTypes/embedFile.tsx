import { FileTypeActions } from '@models/file.ts';
import FileMarkdownDisplay from '@pages/explorer/file/display/displayTypes/FileMarkdownDisplay.tsx';
import { ReactNode, useState } from 'react';
import { FullscreenToggle } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';

export default function EmbedFile({
  file,
  serveUrl,
  isShared,
}: {
  file: FileModelDTO;
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
  file,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  file: FileModelDTO;
}) {
  return (
    <Dialog open={open} onOpenChange={b => !b && onClose()}>
      <DialogContent className={'!max-w-full h-full p-10 rounded-none'}>
        <DialogHeader className={'sr-only'}>
          <DialogTitle>Object View</DialogTitle>
          <DialogDescription>{file.file_name}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function FileObjectDisplay({
  file,
  serveUrl,
}: {
  file: FileModelDTO;
  serveUrl: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  // Using 'object' because iframes seem to be blocked by browsers when loading the files
  const object = (
    <object
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
        file={file}
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
