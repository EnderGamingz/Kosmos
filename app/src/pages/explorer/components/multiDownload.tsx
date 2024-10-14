import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/env.ts';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';
import { useContext, useState } from 'react';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { FolderArrowDownIcon } from '@heroicons/react/24/outline';
import { DisplayContext } from '@lib/contexts.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export function MultiDownload({
  files,
  folders,
  isContextAction,
  onClose,
}: {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
  isContextAction?: boolean;
  onClose?: () => void;
}) {
  const [fileId, setFileId] = useState('');
  const notificationActions = useNotifications(s => s.actions);
  const context = useContext(DisplayContext);
  const shareUuid = context?.shareUuid;

  const downloadAction = useMutation({
    mutationFn: async () => {
      const description = [];
      if (files.length)
        description.push(`${files.length} File${files.length > 1 ? 's' : ''}`);
      if (folders.length)
        description.push(
          `${folders.length} Folder${folders.length > 1 ? 's' : ''}`,
        );

      const fileId = notificationActions.notify({
        title: 'Multi Download',
        description: description.join(', '),
        status: 'Processing',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });

      setFileId(fileId);

      // noinspection JSUnusedGlobalSymbols
      const response = await fetch(
        shareUuid
          ? `${BASE_URL}s/folder/${shareUuid}/multi`
          : `${BASE_URL}auth/multi`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: files.map(file => file.id),
            folders: folders.map(folder => folder.id),
          }),
        },
      );

      if (!response.ok) {
        notificationActions.updateNotification(fileId, {
          severity: Severity.ERROR,
          status: 'Error',
          description: response.statusText || 'Check console',
          canDismiss: true,
        });
        return;
      }

      const total = parseInt(response.headers.get('content-length') || '0');

      notificationActions.updateNotification(fileId, {
        status: 'Downloading',
      });

      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'archive.zip';
      if (contentDisposition) {
        fileName = contentDisposition.substring(
          contentDisposition.lastIndexOf('=') + 1,
        );
      }

      if (!window.WritableStream) {
        // @ts-expect-error Override
        streamSaver.WritableStream = WritableStream;
        // @ts-expect-error Override
        window.WritableStream = WritableStream;
      }

      const fileStream = streamSaver.createWriteStream(fileName);
      const readableStream = response.body;

      // If pipeTo exists, use it as it is more optimized
      if (readableStream?.pipeTo) {
        return readableStream.pipeTo(fileStream).then(() => {
          notificationActions.updateNotification(fileId, {
            status: 'Complete',
            severity: Severity.SUCCESS,
            timeout: 2500,
            canDismiss: true,
          });
        });
      }

      const writer = fileStream.getWriter();
      const reader = response.body?.getReader();

      let downloaded = 0;

      const handleRead: () => Promise<void> | undefined = () => {
        return reader?.read().then(res => {
          if (res.done) {
            return writer.close().then(() => {
              notificationActions.updateNotification(fileId, {
                status: 'Complete',
                severity: Severity.SUCCESS,
                timeout: 2500,
                canDismiss: true,
              });
            });
          } else {
            downloaded += res.value.byteLength;
            notificationActions.updateNotification(fileId, {
              status: 'Downloading',
              description: `${((downloaded / (total || 1)) * 100).toFixed(2)}% Downloaded`,
            });
            return writer.write(res.value).then(handleRead);
          }
        });
      };

      await handleRead();
    },
    onError: () => {
      notificationActions.updateNotification(fileId, {
        status: 'Failed',
        severity: Severity.ERROR,
        timeout: 2500,
        canDismiss: true,
      });
    },
  });

  if (isContextAction) {
    return (
      <button
        onClick={() => {
          downloadAction.mutate();
          onClose && onClose();
        }}
        disabled={downloadAction.isPending}>
        <FolderArrowDownIcon />
        Download
      </button>
    );
  }

  return (
    <button
      className={'disabled:bg-gray-400'}
      onClick={() => downloadAction.mutate()}
      disabled={!files.length && !folders.length}>
      Multi Download
    </button>
  );
}
