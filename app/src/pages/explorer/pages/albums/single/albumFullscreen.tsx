import { createPreviewUrl, createServeUrl } from '@lib/file.ts';
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
  const previewUrl = createPreviewUrl(shareUuid, false, file.id, !!shareUuid);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none !mt-0 flex h-full w-full items-center justify-center p-10 md:p-20',
          'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2',
          '[&>img]:h-auto [&>img]:max-h-[90vh] [&>img]:w-auto [&>img]:max-w-[90vw] [&>img]:rounded-lg',
        )}>
        <DisplayImage
          file={file}
          highRes={serveUrl}
          lowRes={previewUrl}
          onlyImage
        />
      </div>
    </>
  );
}
