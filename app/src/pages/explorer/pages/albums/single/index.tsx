import { useNavigate, useParams } from 'react-router-dom';
import AlbumCover from '@pages/explorer/pages/albums/albumCover.tsx';
import { useEffect, useMemo, useRef } from 'react';
import { AlbumTitle } from '@pages/explorer/pages/albums/single/albumTitle.tsx';
import { AlbumMenu } from '@pages/explorer/pages/albums/single/menu/albumMenu.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { AlbumAddItems } from '@pages/explorer/pages/albums/single/albumAddItems.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useScrollThreshold } from '@hooks/useScrollDirection.ts';

export default function AlbumPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const container = useRef(null);
  const scrolling = useScrollThreshold(container, 50);

  const albumQuery = AlbumQuery.useAlbum(albumId);
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    if (!albumId) navigate('/home/album');
    if (!albumQuery.isPending && !albumQuery.data) navigate('/home/album');

    if (albumQuery.data) {
      setFilesInScope(albumQuery.data.files);
    }
  }, [albumQuery, albumId, navigate, setFilesInScope]);

  const fileIds = useMemo(() => {
    if (!albumQuery.data) return [];
    return albumQuery.data.files.map(file => file.id);
  }, [albumQuery.data]);

  if (!albumQuery.data) return null;

  const { album, files } = albumQuery.data;

  return (
    <div className={'relative'}>
      <div
        ref={container}
        className={
          'max-h-[calc(100dvh-90px)] space-y-5 overflow-y-auto p-5 max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <div className={'h-[120px] sm:h-[180px] lg:h-[200px]'} />
        <div
          className={
            'absolute left-5 right-5 top-5 z-40 !mt-0 flex items-start gap-5 rounded-xl transition-all'
          }
          style={{
            backdropFilter: scrolling ? 'blur(15px)' : 'none',
            WebkitBackdropFilter: scrolling ? 'blur(15px)' : 'none',
            background: scrolling ? 'rgba(255, 255, 255, 0.7)' : 'none',
            padding: scrolling ? '10px' : '0',
          }}>
          <div
            className={'min-w-[100px] transition-all'}
            style={{
              height: scrolling ? 100 : 200,
              width: scrolling ? 100 : 200,
            }}>
            {/* TODO: ADD album cover */}
            <AlbumCover album={album} />
          </div>
          <AlbumTitle album={album} dense={scrolling}>
            <AlbumAddItems id={album.id} added={fileIds} small={scrolling} />
          </AlbumTitle>
          <div className={'ml-auto'}>
            <AlbumMenu album={album} />
          </div>
        </div>
        {/* TODO: ADD overwrite for file display to grid */}
        <ExplorerDataDisplay
          isLoading={albumQuery.isLoading}
          files={files}
          folders={[]}
          viewSettings={{
            limitedView: true,
            noSelect: true,
            scrollControlMissing: true,
          }}
        />
        {!files.length && (
          <EmptyList
            grid
            message={'No files added yet'}
            noIcon
            action={<AlbumAddItems id={album.id} added={fileIds} />}
          />
        )}
      </div>
    </div>
  );
}
