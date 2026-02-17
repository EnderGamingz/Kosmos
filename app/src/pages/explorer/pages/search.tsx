import { useSearch } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { PageMetadata } from '@components/metadata.tsx';
import { RouterLoadingBar } from '@components/header/routerLoading.tsx';

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
      }
    >
      <PageMetadata title={`"${query}" - Search`} />
      {(!search?.data || search.isLoading) && <RouterLoadingBar />}
      <div className={'px-5 pt-5'}>
        <SubPageTitle>Search Results</SubPageTitle>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={'text-stone-600 dark:text-stone-400'}
        >
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
