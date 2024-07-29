import { useFavorites } from '@lib/query.ts';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';

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
      <Progress
        aria-label={'Favorites loading...'}
        isIndeterminate={!favorites?.data || favorites.isLoading}
        value={100}
        className={'absolute left-0 top-0 h-1 opacity-50'}
        color={'default'}
      />
      <div className={'flex items-center justify-between px-5 pt-5'}>
        <div>
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={'text-3xl font-semibold text-stone-800'}>
            Favorites
          </motion.h1>
        </div>
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
