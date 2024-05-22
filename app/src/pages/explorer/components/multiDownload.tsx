import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '../../../vars.ts';
import {
  DownloadStatus,
  useDownloadState,
} from '../../../stores/downloadStore.ts';
import streamSaver from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill';

export function MultiDownload({
  files,
  folders,
}: {
  files: string[];
  folders: string[];
}) {
  const downloadStateActions = useDownloadState(s => s.actions);

  const downloadAction = useMutation({
    mutationFn: async () => {
      let downloadId = new Date().toISOString();

      const description = [];
      if (!!files.length) description.push(`${files.length} Files`);
      if (!!folders.length) description.push(`${folders.length} Folders`);

      downloadStateActions.addDownload({
        id: downloadId,
        name: `Multi Download`,
        description: description.join(', '),
        status: DownloadStatus.INITIATED,
      });

      // noinspection JSUnusedGlobalSymbols
      const response = await fetch(BASE_URL + 'auth/download/multi', {
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

      downloadStateActions.updateDownloadStatus(
        downloadId,
        DownloadStatus.PROGRESS,
      );

      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'archive.zip';
      if (contentDisposition) {
        fileName = contentDisposition.substring(
          contentDisposition.lastIndexOf('=') + 1,
        );
      }

      downloadStateActions.updateDownloadTitle(downloadId, fileName);

      if (!window.WritableStream) {
        // @ts-ignore
        streamSaver.WritableStream = WritableStream;
        // @ts-ignore
        window.WritableStream = WritableStream;
      }

      const fileStream = streamSaver.createWriteStream(fileName);
      const readableStream = response.body;

      // If pipeTo exists, use it as it is more optimized
      if (readableStream?.pipeTo) {
        return readableStream.pipeTo(fileStream).then(() => {
          downloadStateActions.updateDownloadStatus(
            downloadId,
            DownloadStatus.FINISHED,
          );
        });
      }

      // @ts-ignore
      const writer = fileStream.getWriter();
      const reader = response.body?.getReader();

      const handleRead: () => Promise<void> | undefined = () => {
        return reader?.read().then(res => {
          if (res.done) {
            return writer.close().then(() => {
              downloadStateActions.updateDownloadStatus(
                downloadId,
                DownloadStatus.FINISHED,
              );
            });
          } else {
            return writer.write(res.value).then(handleRead);
          }
        });
      };

      handleRead();
    },
  });

  return (
    <button
      className={'disabled:bg-gray-400'}
      onClick={() => downloadAction.mutate()}
      disabled={!files.length && !folders.length}>
      Multi Download
    </button>
  );
}
