import { createServeUrl } from '@lib/file.ts';
import { DisplayImage } from '@pages/explorer/file/display/displayTypes/image/displayImage.tsx';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import tw from '@utils/classMerge.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function AlbumFullscreen({
  file,
  onClose,
  shareUuid,
}: {
  file: FileModelDTO;
  onClose: () => void;
  shareUuid?: string;
}) {
  const serveUrl = createServeUrl(shareUuid, false, file.id, !!shareUuid);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none !mt-0 flex h-full w-full items-center justify-center p-10 md:p-20',
          'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2',
        )}>
        <div
          className={
            'pointer-events-auto isolate grid h-full max-h-[90dvh] [&>*]:w-full [&_img]:bg-contain [&_img]:object-contain'
          }>
          <DisplayImage file={file} highRes={serveUrl} />
        </div>
      </div>
    </>
  );
}
