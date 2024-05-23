import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '../../../vars.ts';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';
import { useState } from 'react';
import { OperationType } from '../../../../models/file.ts';

export function DownloadSingleAction({
  type,
  id,
  name,
}: {
  type: OperationType;
  id: string;
  name: string;
}) {
  const [fileId, setFileId] = useState('');
  const notification = useNotifications(s => s.actions);

  const downloadAction = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BASE_URL}auth/download/${type}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      notification.notify({
        id: fileId,
        title: 'File Download',
        status: 'Downloading...',
        loading: true,
        severity: Severity.INFO,
      });

      if (!window.WritableStream) {
        // @ts-ignore
        streamSaver.WritableStream = WritableStream;
        // @ts-ignore
        window.WritableStream = WritableStream;
      }

      const fileStream = streamSaver.createWriteStream(name);
      const readableStream = response.body;

      // If pipeTo exists, use it as it is more optimized
      if (readableStream?.pipeTo) {
        return readableStream.pipeTo(fileStream).then(() => {
          notification.updateNotification(fileId, {
            status: 'Download complete',
            severity: Severity.SUCCESS,
            timeout: 1000,
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
                status: 'Download complete',
                severity: Severity.SUCCESS,
                timeout: 1000,
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
        status: 'Download error',
        description: 'Check console',
      });
    },
  });

  return (
    <button
      onClick={() => {
        setFileId(new Date().toISOString());
        downloadAction.mutate();
      }}
      disabled={downloadAction.isPending}>
      Download Single
    </button>
  );
}
