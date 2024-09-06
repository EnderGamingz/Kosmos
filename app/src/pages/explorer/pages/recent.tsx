import { useRecentFiles } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Progress } from '@nextui-org/react';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { Helmet } from 'react-helmet';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';

export default function RecentFiles() {
  const files = useRecentFiles();
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => setFilesInScope(files.data || []), [files, setFilesInScope]);

  return (
    <div className={'relative'}>
      <Helmet>
        <title>Recent Files</title>
      </Helmet>
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
          <SubPageTitle>Recent Files</SubPageTitle>
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
