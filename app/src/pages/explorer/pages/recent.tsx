import { useRecentFiles } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';

export default function RecentFiles() {
  const files = useRecentFiles();
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => setFilesInScope(files.data || []), [files, setFilesInScope]);

  return (
    <div className={'relative'}>
      <div
        className={
          'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <Progress
          aria-label={'Recent Files loading...'}
          isIndeterminate={!files?.data || files.isLoading}
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
            Recent Files
          </motion.h1>
        </div>
        <div>
          <ExplorerDataDisplay
            isLoading={files.isLoading}
            files={files.data || []}
            folders={[]}
            viewSettings={{ limitedView: true }}
          />
        </div>
      </div>
    </div>
  );
}
