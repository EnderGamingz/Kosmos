import { FileModel } from '@models/file.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';

export function UsageReportLargeFiles({ files }: { files: FileModel[] }) {
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    setFilesInScope(files);
  }, [files, setFilesInScope]);

  return (
    <div>
      <motion.h3
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.6 }}
        className={'text-xl font-bold text-stone-700'}>
        Large Files
      </motion.h3>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.7 }}>
        <ExplorerDataDisplay
          files={files}
          folders={[]}
          isLoading={false}
          viewSettings={{
            limitedView: true,
            scrollControlMissing: true,
          }}
        />
      </motion.div>
    </div>
  );
}
