import { useFileContent } from '@lib/query.ts';
import { useState } from 'react';
import { FullscreenToggle } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import useDisclosure from '@hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { FilePenLine } from 'lucide-react';
import {
  editorConfig,
  MarkdownEditorContent,
} from '@pages/explorer/file/display/displayTypes/markdown/MarkdownEditorContent.tsx';
import { truncateString } from '@utils/truncate.ts';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getRoot } from 'lexical';
import MarkdownUpdater from '@pages/explorer/file/display/displayTypes/markdown/editor/MarkdownUpdater.tsx';

export function EditMarkdownFile({
  file,
  isMarkdown,
}: {
  file: FileModelDTO;
  isMarkdown: boolean;
  onClose?: () => void;
}) {
  const {
    isOpen,
    onOpenChange,
    onOpen,
    onClose: onDisclosureClose,
  } = useDisclosure();
  const query = useFileContent(file.id);

  const handleClose = () => {
    onDisclosureClose();
    //if (!isMarkdown) onClose?.();
  };

  return (
    <>
      <button type={'button'} onClick={onOpen}>
        <FilePenLine />
        Edit File
      </button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={'max-w-full! h-full! flex flex-col rounded-none'}
        >
          <DialogHeader className={'grow-0'}>
            <DialogTitle>Editing</DialogTitle>
            <DialogDescription>
              {truncateString(file.file_name)} as{' '}
              {isMarkdown ? 'Markdown' : 'Plain Text'}
            </DialogDescription>
          </DialogHeader>
          <MarkdownEditorContent
            file={file}
            initialData={query.data}
            onClose={handleClose}
            isMarkdown={isMarkdown}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MarkdownFullscreenView({
  data,
  open,
  onClose,
  file,
}: {
  data: string;
  open: boolean;
  onClose: () => void;
  file: FileModelDTO;
}) {
  const safeName = truncateString(file.file_name, 30);
  return (
    <Dialog open={open} onOpenChange={b => !b && onClose()}>
      <DialogContent
        className={'max-w-full!  h-full rounded-none flex flex-col'}
      >
        <DialogHeader>
          <DialogTitle>Markdown Preview</DialogTitle>
          <DialogDescription>{safeName}</DialogDescription>
        </DialogHeader>
        <LexicalComposer
          initialConfig={{
            editorState: () =>
              $convertFromMarkdownString(data, TRANSFORMERS, undefined, true),
            ...editorConfig,
          }}
        >
          <div className={'h-50 grow overflow-auto'}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  contentEditable={false}
                  className={'p-2 border outline-none rounded-md'}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </LexicalComposer>
      </DialogContent>
    </Dialog>
  );
}

export default function FileMarkdownDisplay({
  file,
  isShared,
  serveUrl,
}: {
  file: FileModelDTO;
  isShared: boolean;
  serveUrl: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const query = useFileContent(file.id, serveUrl);

  return (
    <>
      <MarkdownFullscreenView
        file={file}
        data={query.data}
        open={fullscreen}
        onClose={() => setFullscreen(false)}
      />
      <div
        className={cn(
          'relative h-full w-full rounded-xl p-3 bg-popover border flex flex-col',
          !isShared ? 'md:pr-5' : 'md:pr-1',
        )}
      >
        <FullscreenToggle
          isFullscreen={fullscreen}
          toggle={() => setFullscreen(prev => !prev)}
          noOffset={isShared}
        />
        {query.data && (
          <LexicalComposer
            initialConfig={{
              editorState: () => {
                const root = $getRoot();
                root.clear();
                $convertFromMarkdownString(
                  query.data,
                  TRANSFORMERS,
                  undefined,
                  true,
                );
              },
              ...editorConfig,
            }}
          >
            <MarkdownUpdater markdown={query.data} />
            <div className='h-50 grow overflow-auto'>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable contentEditable={false} className='p-2' />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </LexicalComposer>
        )}
      </div>
    </>
  );
}
