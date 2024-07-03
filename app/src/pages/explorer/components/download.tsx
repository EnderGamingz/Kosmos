import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/vars.ts';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useState } from 'react';
import { DataOperationType } from '@models/file.ts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export function DownloadSingleAction({
  type,
  id,
  name,
  onClose,
  overwriteUrl,
}: {
  type: DataOperationType;
  id: string;
  name: string;
  onClose?: () => void;
  overwriteUrl?: string;
}) {
  const [fileId, setFileId] = useState('');
  const notification = useNotifications(s => s.actions);

  const downloadAction = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        overwriteUrl || `${BASE_URL}auth/${type}/${id}/action/Download`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const fileId = notification.notify({
        title: 'File Download',
        status: 'Downloading',
        loading: true,
        severity: Severity.INFO,
        canDismiss: false,
      });
      setFileId(fileId);

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
