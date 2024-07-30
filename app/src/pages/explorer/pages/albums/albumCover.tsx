import { AlbumModel } from '@models/album.ts';
import { motion } from 'framer-motion';

export default function AlbumCover({
  album,
  loading,
}: {
  album: AlbumModel;
  loading?: boolean;
}) {
  return (
    <motion.div
      layoutId={`album-cover-${album.id}`}
      className={'relative aspect-square rounded-lg bg-stone-200'}>
      {loading && (
        <div
          className={
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }>
          <div className={'app-loading-indicator !h-10 !w-10'} />
        </div>
      )}
    </motion.div>
  );
}
