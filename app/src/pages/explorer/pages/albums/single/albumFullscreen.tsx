import { createPreviewUrl, createServeUrl } from '@lib/file.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { ImageFullscreenView } from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';

export function AlbumFullscreen({
  file,
  onClose,
  shareUuid,
}: {
  file?: FileModelDTO;
  onClose: () => void;
  shareUuid?: string;
}) {
  if (!file) return null;
  const serveUrl = createServeUrl(shareUuid, false, file.id, !!shareUuid);
  const previewUrl = createPreviewUrl(shareUuid, false, file.id, !!shareUuid);

  return (
    <ImageFullscreenView
      src={serveUrl}
      open
      file={file}
      tooLarge={false}
      onDoubleClick={onClose}
      previewSrc={previewUrl}
    />
  );
}
