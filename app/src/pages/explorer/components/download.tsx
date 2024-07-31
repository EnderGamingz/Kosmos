import { useMutation } from '@tanstack/react-query';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useContext, useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { DisplayContext, DisplayContextType } from '@lib/contexts.ts';
import { createDownloadUrl } from '@lib/file.ts';

export function DownloadSingleAction({
  id,
  name,
  onClose,
  shareUuid,
}: {
  id: string;
  name: string;
  onClose?: () => void;
  shareUuid?: string;
}) {
  const [fileId, setFileId] = useState('');
  const notification = useNotifications(s => s.actions);
  const context: DisplayContextType | undefined = useContext(DisplayContext);
  const folderShareUuid = context?.shareUuid;

  const downloadUrl = createDownloadUrl(shareUuid, folderShareUuid, id);

  const downloadAction = useMutation({
    mutationFn: async () => {
      const fileId = notification.notify({
        title: 'File Download',
        status: 'Downloading',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });

      setFileId(fileId);

      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        notification.updateNotification(fileId, {
          severity: Severity.ERROR,
          status: 'Error',
          description: response.statusText || 'Check console',
          canDismiss: true,
        });
        return;
      }

      if (!window.WritableStream) {
        // @ts-expect-error Override
        streamSaver.WritableStream = WritableStream;
        // @ts-expect-error Override window
        window.WritableStream = WritableStream;
      }

      const fileStream = streamSaver.createWriteStream(name);
      const readableStream = response.body;

      // If pipeTo exists, use it as it is more optimized
      if (readableStream?.pipeTo) {
        return readableStream.pipeTo(fileStream).then(() => {
          notification.updateNotification(fileId, {
            status: 'Complete',
            severity: Severity.SUCCESS,
            timeout: 1000,
            canDismiss: true,
          });
        });
      }

      const writer = fileStream.getWriter();
      const reader = response.body?.getReader();

      const handleRead: () => Promise<void> | undefined = () => {
        return reader?.read().then(res => {
          if (res.done) {
            return writer.close().then(() => {
              notification.updateNotification(fileId, {
                status: 'Complete',
                severity: Severity.SUCCESS,
                timeout: 1000,
                canDismiss: true,
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
      notification.updateNotification(fileId, {
        severity: Severity.ERROR,
        status: 'Error',
        description: 'Check console',
        canDismiss: true,
      });
    },
  });

  return (
    <button
      onClick={() => {
        downloadAction.mutate();
        onClose?.();
      }}
      disabled={downloadAction.isPending}>
      <ArrowDownTrayIcon />
      Download
    </button>
  );
}
