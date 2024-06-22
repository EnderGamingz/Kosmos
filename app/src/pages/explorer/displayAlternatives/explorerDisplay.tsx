import { FolderModel } from '@models/folder.ts';
import { FileModel } from '@models/file.ts';
import { FileTableLoading } from '@pages/explorer/displayAlternatives/fileTable/fileTableLoading.tsx';
import { FileTable } from '@pages/explorer/displayAlternatives/fileTable/fileTable.tsx';
import { ExplorerDisplayWrapper } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper.tsx';

export default function ExplorerDisplay({
  isLoading,
  files,
  folders,
}: {
  isLoading: boolean;
  files: FileModel[];
  folders: FolderModel[];
}) {
  if (isLoading) return <FileTableLoading />;

  return (
    <ExplorerDisplayWrapper files={files} folders={folders}>
      <FileTable />
    </ExplorerDisplayWrapper>
  );
}
