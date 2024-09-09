import { useFavorites } from '@lib/query.ts';
import { Progress } from '@nextui-org/react';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';

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
      <Helmet>
        <title>Favorites</title>
      </Helmet>
      <Progress
        aria-label={'Favorites loading...'}
        isIndeterminate={!favorites?.data || favorites.isLoading}
        value={100}
        className={'absolute left-0 top-0 h-1 opacity-50'}
        color={'default'}
      />
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
