import { motion } from 'framer-motion';
import { createPreviewUrl } from '@lib/file.ts';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';

export default function AlbumCover({
  album,
  loading,
  shareUuid,
}: {
  album: AlbumModelDTO;
  loading?: boolean;
  shareUuid?: string;
}) {
  return (
    <motion.div
      layoutId={`album-cover-${album.id}`}
      className={
        'relative aspect-square h-auto w-full rounded-lg bg-stone-200 dark:bg-stone-700'
      }>
      {loading && (
        <div
          className={
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }>
          <div className={'app-loading-indicator !h-10 !w-10'} />
        </div>
      )}
      {album.preview_id && (
        <AlbumCoverImage album={album} shareUuid={shareUuid} />
      )}
    </motion.div>
  );
}

function AlbumCoverImage({
  album,
  shareUuid,
}: {
  album: AlbumModelDTO;
  shareUuid?: string;
}) {
  const previewUrl = createPreviewUrl(
    shareUuid,
    false,
    album.preview_id,
    !!shareUuid,
  );
  return (
    <img
      className={
        'absolute inset-0 h-full w-full rounded-lg bg-cover bg-center bg-no-repeat object-cover'
      }
      src={previewUrl}
      alt={album.name}
    />
  );
}
