import { useRecentFiles } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { Progress } from '@components/ui/progress.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function RecentFiles() {
  const files = useRecentFiles();
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => setFilesInScope(files.data || []), [files, setFilesInScope]);

  return (
    <>
      <PageMetadata title={'Recent Files'} />
      <div
        className={
          'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <Progress
          aria-label={'Recent Files loading...'}
          indeterminate={!files?.data || files.isLoading}
          value={100}
          className={'absolute left-0 top-0 h-1 opacity-50'}
          color={'default'}
        />
        <div className={'p-5'}>
          <SubPageTitle>Recent Files</SubPageTitle>
        </div>
        <div className={'relative grow'}>
          <ExplorerDataDisplay
            isLoading={files.isLoading}
            files={files.data || []}
            folders={[]}
            viewSettings={{ limitedView: true }}
          />
        </div>
      </div>
    </>
  );
}
