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
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { ExplorerDisplay } from '@stores/preferenceStore.ts';
import { GridSizeSlider } from '@pages/explorer/pages/albums/single/gridSizeSlider.tsx';
import { AlbumFullscreen } from '@pages/explorer/pages/albums/single/albumFullscreen.tsx';
import { AnimatePresence } from 'framer-motion';
import { DisplayContext } from '@lib/contexts.ts';
import tw from '@utils/classMerge.ts';
import { Helmet } from 'react-helmet';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { getInitialGridSize } from '@utils/grid.ts';
import { useArrowKeys } from '@utils/registers/arrowKeys.ts';

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
      <Helmet>
        <title>
          {albumQuery.data ? `${albumQuery.data.album.name}` : 'Album'}
        </title>
      </Helmet>
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

export function AlbumPageContent({
  album,
  files,
  scrolling,
  shareUuid,
}: {
  album: AlbumModelDTO;
  files: FileModelDTO[];
  scrolling: boolean;
  shareUuid?: string;
}) {
  const [selected, setSelected] = useState<number>(-1);
  const [size, setSize] = useState(getInitialGridSize());

  useArrowKeys({
    left: () =>
      setSelected(prev => {
        if (prev - 1 < 0) {
          return -1;
        }
        return prev - 1;
      }),
    right: () =>
      setSelected(prev => {
        if (prev + 1 > files.length) {
          return files.length;
        }
        return prev + 1;
      }),
    deps: [files.length],
  });

  const file = useMemo(() => {
    if (files.length === 0) return undefined;
    if (selected === -1 || selected > files.length - 1 || selected < 0)
      return undefined;
    return files.at(selected) as FileModelDTO;
  }, [files, selected]);

  return (
    <DisplayContext.Provider
      value={{
        shareUuid,
        handleContext: () => {},
        files,
        folders: [],
        select: {
          rangeStart: 0,
          setRange: () => {},
        },
        dragMove: {
          setDrag: () => {},
          resetDrag: () => {},
        },
      }}>
      <div aria-hidden className={'max-h-[200px] min-h-[200px]'} />
      <div
        className={tw(
          'absolute left-5 right-5 top-5 z-40 !mt-0 flex items-start gap-5 rounded-b-xl transition-all',
          scrolling &&
            'left-0 right-0 top-0 bg-stone-50/70 p-2 backdrop-blur-lg dark:bg-stone-900/70',
        )}>
        <div
          className={'min-w-[60px] transition-all'}
          style={{
            height: scrolling ? 60 : 200,
            width: scrolling ? 60 : 200,
          }}>
          <AlbumCover album={album} shareUuid={shareUuid} />
        </div>
        <AlbumTitle album={album} dense={scrolling} disabled={!!shareUuid}>
          {!shareUuid && (
            <AlbumAddItems id={album.id} added={files} small={scrolling} />
          )}
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
            noActions: true,
            noDisplay: true,
            album: {
              data: album,
              onFileClick: setSelected,
            },
          }}
          shareUuid={shareUuid}
          overwriteDisplay={{
            displayMode: ExplorerDisplay.Album,
            gridSize: size,
          }}
        />
      </div>
      <AnimatePresence>
        {file && (
          <AlbumFullscreen
            file={file}
            onClose={() => setSelected(-1)}
            shareUuid={shareUuid}
          />
        )}
      </AnimatePresence>
      {!files.length && !shareUuid && (
        <EmptyList
          grid
          message={'No files added yet'}
          noIcon
          action={<AlbumAddItems id={album.id} added={files} />}
        />
      )}
    </DisplayContext.Provider>
  );
}
