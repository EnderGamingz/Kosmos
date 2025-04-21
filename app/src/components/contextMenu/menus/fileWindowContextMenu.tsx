import { ContextMenuTitle } from '@components/contextMenu/contextMenuTitle.tsx';
import { FileUploadButtonControlled } from '@pages/explorer/components/upload/fileUpload.tsx';
import { Link } from 'react-router-dom';
import { CreateFolder } from '@pages/explorer/folder/createFolder.tsx';
import { CreateMarkdownFile } from '@components/header/new/createMarkdownFile.tsx';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { Clock } from 'lucide-react';

export function FileWindowContextMenu({ onClose }: { onClose: () => void }) {
  const currentFolder = useExplorerStore(s => s.current.folder);

  return (
    <div className={'flex flex-col gap-[inherit] [&>div]:animate-fade-in-top'}>
      <div>
        <ContextMenuTitle type={'create'} title={'New'} />
      </div>
      <div className={'!delay-50'}>
        <FileUploadButtonControlled onClose={onClose} />
      </div>
      <div className={'!delay-100'}>
        <Link
          title={'Quick Share'}
          to={'/home/quick'}
          onClick={onClose}
          className={'menu-button py-2'}>
          <Clock className={'h-5 w-5'} />
          Quick Share
        </Link>
      </div>
      <div className={'!delay-150'}>
        <CreateFolder onClose={onClose} folder={currentFolder} />
      </div>
      <div className={'!delay-200'}>
        <CreateMarkdownFile onClose={onClose} folder={currentFolder} />
      </div>
    </div>
  );
}
