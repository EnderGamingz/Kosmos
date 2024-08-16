import { FileModel } from '@models/file.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { invalidateFiles, setFileContent, useFileContent } from '@lib/query.ts';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
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
import tw from '@utils/classMerge.ts';
import { FullscreenToggle } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import { Portal } from 'react-portal';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { truncateString } from '@utils/truncate.ts';

function MarkdownEditorContent({
  file,
  initialData,
  onClose,
  isMarkdown,
}: {
  file: FileModel;
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
    <ModalContent
      className={'bg-[var(--markdown-bg)] text-[var(--markdown-fg)]'}>
      <ModalHeader>
        Editing
        <p className={'mx-1 font-light'}>
          {truncateString(file.file_name)}
        </p> as {isMarkdown ? 'Markdown' : 'Plain Text'}
      </ModalHeader>
      <ModalBody className={'px-2 py-0 md:px-5'}>
        <div
          className={tw(
            'h-full w-full flex-grow rounded-lg shadow-lg',
            isMarkdown
              ? 'overflow-hidden'
              : 'h-[calc(100vh-60px-72px-29px)] overflow-y-auto',
          )}>
          {isMarkdown ? (
            <MarkdownEditor
              height={'calc(100vh - 60px - 72px - 29px)'}
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
      </ModalBody>
      <ModalFooter>
        <button className={'btn-black'} onClick={() => saveAction.mutate()}>
          <CheckIcon /> Save
        </button>
      </ModalFooter>
    </ModalContent>
  );
}

export function EditMarkdownFile({
  file,
  isMarkdown,
  onClose,
}: {
  file: FileModel;
  isMarkdown: boolean;
  onClose?: () => void;
}) {
  const {
    isOpen,
    onOpenChange,
    onOpen,
    onClose: onDisclosureClose,
  } = useDisclosure();
  const query = useFileContent(undefined, file.id);

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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={'full'}>
        <MarkdownEditorContent
          file={file}
          initialData={query.data}
          onClose={handleClose}
          isMarkdown={isMarkdown}
        />
      </Modal>
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

export default function FileMarkdownDisplay({
  file,
  isShared,
  serveUrl,
}: {
  file: FileModel;
  isShared: boolean;
  serveUrl: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const query = useFileContent(serveUrl);

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
        className={tw(
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
          className={tw('h-full overflow-y-auto', !isShared && 'pb-10')}
        />
      </motion.div>
    </>
  );
}
