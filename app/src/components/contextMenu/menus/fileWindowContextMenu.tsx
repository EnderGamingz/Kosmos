import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { FileUploadButtonControlled } from '@pages/explorer/components/upload/fileUpload.tsx';
import { Link } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import { CreateFolder } from '@pages/explorer/folder/createFolder.tsx';
import { CreateMarkdownFile } from '@components/header/new/createMarkdownFile.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';

export function FileWindowContextMenu({ onClose }: { onClose: () => void }) {
  const currentFolder = useExplorerStore(s => s.current.folder);

  return (
    <>
      <ContextMenuTitle type={'create'} title={'New'} />
      <FileUploadButtonControlled onClose={onClose} />
      <Link
        title={'Quick Share'}
        to={'/home/quick'}
        onClick={onClose}
        className={'menu-button py-2'}>
        <ClockIcon className={'h-5 w-5'} />
        Quick Share
      </Link>
      <CreateFolder onClose={onClose} folder={currentFolder} />
      <CreateMarkdownFile onClose={onClose} folder={currentFolder} />
    </>
  );
}
