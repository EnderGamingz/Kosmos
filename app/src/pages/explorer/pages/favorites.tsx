import { useFavorites } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function FavoritesPage() {
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);
  const favorites = useFavorites();

  useEffect(() => {
    setFilesInScope(favorites.data?.files || []);
  }, [favorites.data?.files, setFilesInScope]);

  return (
    <div
      className={
        'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
      }>
      <PageMetadata title={'Favorites'} />
      <div className={'flex items-center justify-between px-5 pt-5'}>
        <SubPageTitle>Favorites</SubPageTitle>
      </div>
      <ExplorerDataDisplay
        isLoading={favorites.isLoading}
        files={favorites.data?.files || []}
        folders={favorites.data?.folders || []}
        viewSettings={{
          limitedView: true,
        }}
      />
    </div>
  );
}
