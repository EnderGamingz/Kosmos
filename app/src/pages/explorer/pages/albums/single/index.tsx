import { useNavigate, useParams } from 'react-router-dom';
import AlbumCover from '@pages/explorer/pages/albums/albumCover.tsx';
import { useAlbum } from '@lib/query.ts';
import { useEffect } from 'react';
import { AlbumTitle } from '@pages/explorer/pages/albums/single/albumTitle.tsx';

export default function AlbumPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();

  const albumQuery = useAlbum(albumId);

  useEffect(() => {
    if (!albumId) navigate('/home/album');
    if (!albumQuery.isPending && !albumQuery.data) navigate('/home/album');
  }, [albumQuery, albumId, navigate]);

  if (!albumQuery.data) return null;

  const { album, files } = albumQuery.data;

  return (
    <div className={'p-5'}>
      <div className={'flex gap-5'}>
        <div className={'w-full min-w-[100px] max-w-[200px]'}>
          <AlbumCover album={album} />
        </div>
        <AlbumTitle album={album} />
        {/* TODO: Add delete action */}
      </div>
      {/* TODO: Add files */}
    </div>
  );
}
