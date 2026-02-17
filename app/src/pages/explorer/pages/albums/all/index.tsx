import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AlbumItem } from '@pages/explorer/pages/albums/all/albumItem.tsx';
import { CreateAlbum } from '@pages/explorer/pages/albums/createAlbum.tsx';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function AlbumsPage() {
  const albums = AlbumQuery.useAlbums();
  return (
    <div className={'relative'}>
      <PageMetadata title={'Albums'} />
      <div
        className={
          'h-full max-h-[calc(100dvh-90px-80px)] space-y-5 overflow-y-auto p-5'
        }
      >
        <div className={'flex items-center justify-between'}>
          <SubPageTitle>Albums</SubPageTitle>
          <CreateAlbum />
        </div>
        <ul
          className={
            'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }
        >
          {!albums.data?.length && <EmptyList grid message={'No albums'} />}
          {albums.data?.map(album => (
            <AlbumItem key={album.id} album={album} />
          ))}
        </ul>
      </div>
    </div>
  );
}
