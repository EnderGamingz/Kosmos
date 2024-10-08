import { useNavigate } from 'react-router-dom';
import AlbumCover from '@pages/explorer/pages/albums/albumCover.tsx';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';

export function AlbumItem({ album }: { album: AlbumModelDTO }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleClick() {
    if (loading) return;
    setLoading(true);
    AlbumQuery.prefetchAlbum(album.id)
      .then(() => {
        navigate(`/home/album/${album.id}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <li className={'flex items-center justify-between'}>
      <div
        onClick={handleClick}
        className={'w-full text-xl text-stone-700 dark:text-stone-300'}>
        <AlbumCover album={album} loading={loading} />
        <div className={'flex flex-col'}>
          <motion.p
            title={album.name}
            className={'truncate font-medium'}
            layout={'preserve-aspect'}
            layoutId={`album-name-${album.id}`}>
            {album.name}
          </motion.p>
        </div>
      </div>
    </li>
  );
}
