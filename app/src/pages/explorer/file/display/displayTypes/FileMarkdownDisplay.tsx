import { AnimatePresence, motion } from 'framer-motion';
import { invalidateFiles, setFileContent, useFileContent } from '@lib/query.ts';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useState } from 'react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { FullscreenToggle } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import { Portal } from 'react-portal';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { truncateString } from '@utils/truncate.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';
import useDisclosure from '@hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Button } from '@components/ui/button.tsx';

function MarkdownEditorContent({
  file,
  initialData,
  onClose,
  isMarkdown,
}: {
  file: FileModelDTO;
  initialData: string;
  onClose: () => void;
  isMarkdown: boolean;
}) {
  const notifications = useNotifications(s => s.actions);
  const [code, setCode] = useState(initialData);

  const saveAction = useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Update file',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .post(`${BASE_URL}auth/file/${file.id}/content`, {
          content: code,
        })
        .then(() => {
          onClose();
          setFileContent(file.id, code);
          invalidateFiles().then();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Updated',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(() => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Failed to update',
            timeout: 1000,
            canDismiss: true,
          });
        });
    },
  });

  return (
    <DialogContent
      className={
        '!max-w-full bg-[var(--markdown-bg)] text-[var(--markdown-fg)]'
      }>
      <DialogHeader>
        <DialogTitle>Editing</DialogTitle>
        <DialogDescription>
          {truncateString(file.file_name)} as{' '}
          {isMarkdown ? 'Markdown' : 'Plain Text'}
        </DialogDescription>
      </DialogHeader>
      <div className={'p-0'}>
        <div
          className={cn(
            'h-full w-full flex-grow rounded-lg shadow-lg border',
            isMarkdown
              ? 'overflow-hidden'
              : 'h-[calc(100vh-60px-72px-60px)] overflow-y-auto',
          )}>
          {isMarkdown ? (
            <MarkdownEditor
              height={'calc(100vh - 60px - 72px - 60px)'}
              value={code}
              onChange={value => setCode(value)}
              showToolbar={isMarkdown}
              enablePreview={isMarkdown}
              visible={isMarkdown}
            />
          ) : (
            <CodeEditor
              value={code}
              onChange={e => setCode(e.target.value)}
              language={'plaintext'}
              placeholder={'Write some text'}
            />
          )}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => saveAction.mutate()}>
          <CheckIcon /> Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function EditMarkdownFile({
  file,
  isMarkdown,
  onClose,
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
    !isMarkdown && onClose?.();
  };

  return (
    <>
      <button onClick={onOpen}>
        <PencilSquareIcon />
        Edit File
      </button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <MarkdownEditorContent
          file={file}
          initialData={query.data}
          onClose={handleClose}
          isMarkdown={isMarkdown}
        />
      </Dialog>
    </>
  );
}

export function MarkdownFullscreenView({
  data,
  open,
  onClose,
  id,
}: {
  data: string;
  open: boolean;
  onClose: () => void;
  id: string;
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
            <motion.div layoutId={`markdown-display-${id}`}>
              <MarkdownEditor.Markdown
                source={data}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                className={'h-full overflow-y-auto p-3'}
              />
            </motion.div>
            <motion.div
              onClick={onClose}
              className={cn(
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
        id={file.id}
        data={query.data}
        open={fullscreen}
        onClose={() => setFullscreen(false)}
      />
      <motion.div
        layoutId={`markdown-display-${file.id}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative h-full w-full rounded-xl bg-[var(--markdown-bg)] p-3 text-stone-50 shadow-lg',
          !isShared ? 'md:pr-5' : 'md:pr-1',
        )}>
        <FullscreenToggle
          isFullscreen={fullscreen}
          toggle={() => setFullscreen(prev => !prev)}
          noOffset={isShared}
        />
        <MarkdownEditor.Markdown
          source={query.data}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          className={cn('h-full overflow-y-auto', !isShared && 'pb-10')}
        />
      </motion.div>
    </>
  );
}
