import { useRecentFiles } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function RecentFiles() {
  const files = useRecentFiles();
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => setFilesInScope(files.data || []), [files, setFilesInScope]);

  return (
    <>
      <PageMetadata title={'Recent Files'} />
      <div
        className={'file-list relative flex h-full flex-col overflow-y-auto'}
      >
        <div className={'p-5'}>
          <SubPageTitle>Recent Files</SubPageTitle>
        </div>
        <ExplorerDataDisplay
          isLoading={files.isLoading}
          files={files.data || []}
          folders={[]}
          viewSettings={{
            limitedView: true,
            // Magic shit again
            additionalHeightReduction: [36],
          }}
        />
      </div>
    </>
  );
}
