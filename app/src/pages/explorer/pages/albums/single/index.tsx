import { useNavigate, useParams } from 'react-router-dom';
import AlbumCover from '@pages/explorer/pages/albums/albumCover.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlbumTitle } from '@pages/explorer/pages/albums/single/albumTitle.tsx';
import { AlbumMenu } from '@pages/explorer/pages/albums/single/menu/albumMenu.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { AlbumAddItems } from '@pages/explorer/pages/albums/single/albumAddItems.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useScrollThreshold } from '@hooks/useScrollDirection.ts';
import { FileModel } from '@models/file.ts';
import { AlbumModel } from '@models/album.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { ExplorerDisplay } from '@stores/preferenceStore.ts';
import { GridSizeSlider } from '@pages/explorer/pages/albums/single/gridSizeSlider.tsx';
import { AlbumFullscreen } from '@pages/explorer/pages/albums/single/albumFullscreen.tsx';
import { AnimatePresence } from 'framer-motion';

export default function AlbumPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const container = useRef(null);
  const scrolling = useScrollThreshold(container, 20);

  const albumQuery = AlbumQuery.useAlbum(albumId);
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    if (!albumId) navigate('/home/album');
    if (!albumQuery.isPending && !albumQuery.data) navigate('/home/album');

    if (albumQuery.data) {
      setFilesInScope(albumQuery.data.files);
    }
  }, [albumQuery, albumId, navigate, setFilesInScope]);

  return (
    <div className={'relative h-full'}>
      <div
        ref={container}
        className={
          'flex h-full max-h-[calc(100dvh-90px)] flex-col space-y-5 overflow-y-auto p-5 max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        {albumQuery.data && (
          <AlbumPageContent
            album={albumQuery.data.album}
            files={albumQuery.data.files}
            scrolling={scrolling}
          />
        )}
      </div>
    </div>
  );
}

function AlbumPageContent({
  album,
  files,
  scrolling,
}: {
  album: AlbumModel;
  files: FileModel[];
  scrolling: boolean;
}) {
  const [selected, setSelected] = useState<FileModel | undefined>(undefined);
  const [size, setSize] = useState(7);
  const fileIds = useMemo(() => files.map(file => file.id), [files]);

  return (
    <>
      <div className={'max-h-[200px] min-h-[200px]'} />
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
        <div className={'ml-auto text-stone-800'}>
          <AlbumMenu album={album}>
            <GridSizeSlider
              value={size}
              onChange={value => setSize(Number(value))}
            />
          </AlbumMenu>
        </div>
      </div>
      <div className={'flex flex-grow flex-col'}>
        <ExplorerDataDisplay
          isLoading={false}
          files={files}
          folders={[]}
          viewSettings={{
            album: {
              data: album,
              onFileClick: (file: FileModel) => {
                setSelected(file);
              },
            },
          }}
          overwriteDisplay={{
            displayMode: ExplorerDisplay.Album,
            gridSize: size,
          }}
        />
      </div>
      <AnimatePresence>
        {selected && (
          <AlbumFullscreen
            file={selected}
            onClose={() => setSelected(undefined)}
          />
        )}
      </AnimatePresence>
      {!files.length && (
        <EmptyList
          grid
          message={'No files added yet'}
          noIcon
          action={<AlbumAddItems id={album.id} added={fileIds} />}
        />
      )}
    </>
  );
}
