import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/vars.ts';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';
import { useState } from 'react';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { FolderArrowDownIcon } from '@heroicons/react/24/outline';

export function MultiDownload({
  files,
  folders,
  isContextAction,
  onClose,
}: {
  files: string[];
  folders: string[];
  isContextAction?: boolean;
  onClose?: () => void;
}) {
  const [fileId, setFileId] = useState('');
  const notificationActions = useNotifications(s => s.actions);

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
        status: 'Processing archive',
        loading: true,
        severity: Severity.INFO,
      });
      setFileId(fileId);

      // noinspection JSUnusedGlobalSymbols
      const response = await fetch(`${BASE_URL}auth/multi`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: files,
          folders: folders,
        }),
      });

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
            status: 'Download complete',
            severity: Severity.SUCCESS,
            timeout: 2500,
          });
        });
      }

      const writer = fileStream.getWriter();
      const reader = response.body?.getReader();

      const handleRead: () => Promise<void> | undefined = () => {
        return reader?.read().then(res => {
          if (res.done) {
            return writer.close().then(() => {
              notificationActions.updateNotification(fileId, {
                status: 'Download complete',
                severity: Severity.SUCCESS,
                timeout: 2500,
              });
            });
          } else {
            return writer.write(res.value).then(handleRead);
          }
        });
      };

      handleRead();
    },
    onError: () => {
      notificationActions.updateNotification(fileId, {
        title: 'Download failed',
        severity: Severity.ERROR,
        timeout: 2500,
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
