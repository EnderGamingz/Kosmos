import { Progress } from '@nextui-org/react';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AlbumItem } from '@pages/explorer/pages/albums/all/albumItem.tsx';
import { CreateAlbum } from '@pages/explorer/pages/albums/createAlbum.tsx';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';

export default function AlbumsPage() {
  const albums = AlbumQuery.useAlbums();
  return (
    <div>
      <Progress
        aria-label={'Recent Files loading...'}
        isIndeterminate={!albums?.data || albums.isLoading}
        value={100}
        className={'absolute left-0 top-0 h-1 opacity-50'}
        color={'default'}
      />
      <div className={'space-y-5 p-5'}>
        <div className={'flex items-center justify-between'}>
          <h1 className={'text-3xl font-light'}>Albums</h1>
          <CreateAlbum />
        </div>
        <ul
          className={
            'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }>
          {!albums.data?.length && <EmptyList grid message={'No albums'} />}
          {albums.data?.map(album => (
            <AlbumItem key={album.id} album={album} />
          ))}
        </ul>
      </div>
    </div>
  );
}
