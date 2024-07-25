import { useSearch } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const search = useSearch(query);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchParams.get('q')) {
      navigate('/home');
    }
  }, [navigate, searchParams]);

  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(
    () => setFilesInScope(search.data?.files || []),
    [search.data, setFilesInScope],
  );

  return (
    <div
      className={
        'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
      }>
      <Progress
        aria-label={'Recent Files loading...'}
        isIndeterminate={!search?.data || search.isLoading}
        value={100}
        className={'absolute left-0 top-0 h-1 opacity-50'}
        color={'default'}
      />
      <div className={'px-5 pt-5'}>
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={'text-3xl font-semibold text-stone-800'}>
          Search Results
        </motion.h1>

        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={'text-stone-600'}>
          {search.data
            ? `Found ${search.data?.files.length} file${search.data?.files.length === 1 ? '' : 's'} and ${search.data?.folders.length} folder${search.data?.folders.length === 1 ? '' : 's'} for "${query}"`
            : search.isLoading
              ? 'Searching...'
              : `No results for "${query}"`}
        </motion.p>
      </div>
      <ExplorerDataDisplay
        isLoading={search.isLoading}
        files={search.data?.files || []}
        folders={search.data?.folders || []}
        viewSettings={{
          limitedView: true,
        }}
      />
    </div>
  );
}
