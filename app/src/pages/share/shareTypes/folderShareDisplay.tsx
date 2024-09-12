import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { FileListBreadCrumbs } from '@pages/explorer/fileListBreadCrumbs.tsx';
import { Route, Routes, useParams } from 'react-router-dom';
import { useAccessShareFolder } from '@lib/query.ts';
import { AxiosError } from 'axios';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { useEffect } from 'react';
import { ShareMessage } from '@pages/share/shareMessage.tsx';
import { ShareError } from '@pages/share/shareError.tsx';
import { Helmet } from 'react-helmet';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export function FolderShareDisplay({ uuid }: { uuid: string }) {
  return (
    <Routes>
      <Route path={''} element={<Display uuid={uuid} />} />
      <Route path={':folderId'} element={<Display uuid={uuid} />} />
    </Routes>
  );
}

function Display({ uuid }: { uuid: string }) {
  const { folderId } = useParams();
  const share = useAccessShareFolder(uuid, folderId);
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    if (share.data)
      setFilesInScope(share.data.files as unknown as FileModelDTO[]);
  }, [setFilesInScope, share.data]);

  if (share.isLoading)
    return <ShareMessage text={`Loading folder share...`} loading={true} />;
  if (!share.data)
    return <ShareError type={'folder'} error={share.error as AxiosError} />;

  return (
    <>
      <Helmet>
        <title>{share.data.folder?.folder_name ?? 'Shared Folder'}</title>
      </Helmet>
      <FileListBreadCrumbs
        crumbs={share.data?.structure}
        firstHome={`/s/folder/${uuid}`}
        shareUuid={uuid}
      />
      <ExplorerDataDisplay
        isLoading={false}
        files={(share.data.files as unknown as FileModelDTO[]) || []}
        folders={(share.data.folders as FolderModelDTO[]) || []}
        shareUuid={uuid}
      />
    </>
  );
}
