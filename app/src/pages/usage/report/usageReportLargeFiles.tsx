import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function UsageReportLargeFiles({ files }: { files: FileModelDTO[] }) {
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    setFilesInScope(files);
  }, [files, setFilesInScope]);

  return (
    <div className={'h-200 flex flex-col'}>
      <h3
        className={
          'text-xl font-bold text-stone-700 dark:text-stone-300 animate-fade-in-top delay-600'
        }
      >
        Large Files
      </h3>
      <div className={'animate-fade-in-top delay-700 grow flex flex-col'}>
        <ExplorerDataDisplay
          files={files}
          folders={[]}
          isLoading={false}
          viewSettings={{
            limitedView: true,
            scrollControlMissing: true,
          }}
        />
      </div>
    </div>
  );
}
