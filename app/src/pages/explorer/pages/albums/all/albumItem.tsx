import { AlbumModel } from '@models/album.ts';
import { useNavigate } from 'react-router-dom';
import AlbumCover from '@pages/explorer/pages/albums/albumCover.tsx';
import { useState } from 'react';
import { prefetchAlbum } from '@lib/query.ts';
import { motion } from 'framer-motion';

export function AlbumItem({ album }: { album: AlbumModel }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleClick() {
    if (loading) return;
    setLoading(true);
    prefetchAlbum(album.id)
      .then(() => {
        navigate(`/home/album/${album.id}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <li className={'flex items-center justify-between'}>
      <div onClick={handleClick} className={'w-full text-lg font-medium'}>
        <AlbumCover album={album} loading={loading} />
        <div>
          <motion.p layout={'position'} layoutId={`album-name-${album.id}`}>
            {album.name}
          </motion.p>
        </div>
      </div>
    </li>
  );
}
