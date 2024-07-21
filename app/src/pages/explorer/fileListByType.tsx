import { useNavigate, useParams } from 'react-router-dom';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useFileByTypeInfinite } from '@lib/query.ts';
import { getFileTypeString } from '@models/file.ts';
import { useEffect } from 'react';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';

export default function FileListByType() {
  const navigate = useNavigate();
  const { fileType } = useParams();
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  const fileTypeParsed = fileType ? parseInt(fileType) : 0;

  if (!fileType || isNaN(parseInt(fileType))) {
    navigate('/home');
  }

  const fileQuery = useFileByTypeInfinite(fileTypeParsed, 50);

  useEffect(() => {
    setFilesInScope(fileQuery.data?.pages.flat() || []);
  }, [fileQuery.data?.pages, setFilesInScope]);

  if (!fileType) return null;
  return (
    <div
      className={
        'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
      }>
      <div className={'p-5'}>
        <h1>
          Showing files of type{' '}
          <span className={'font-semibold'}>
            {getFileTypeString(fileTypeParsed)}
          </span>
        </h1>
      </div>
      <ExplorerDataDisplay
        isLoading={fileQuery.isLoading}
        files={fileQuery.data?.pages.flat() || []}
        folders={[]}
        viewSettings={{
          limitedView: true,
          paged: true,
          hasNextPage: fileQuery.hasNextPage,
          onLoadNextPage: async () => {
            if (fileQuery.isFetching) return;
            await fileQuery.fetchNextPage();
          },
        }}
      />
    </div>
  );
}
