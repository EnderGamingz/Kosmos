import { useParams } from 'react-router-dom';
import { DataOperationType } from '@models/file.ts';
import { FileShareDisplay } from '@pages/share/fileShareDisplay.tsx';
import { FolderShareDisplay } from '@pages/share/folderShareDisplay.tsx';
import { ShareMessage } from '@pages/share/shareMessage.tsx';

export default function SharePage() {
  const { type, uuid } = useParams();
  if (!type || !uuid) {
    return <ShareMessage text={'Invalid share link'} />;
  }

  return (
    <SharePageData type={type === 'folder' ? 'folder' : 'file'} uuid={uuid} />
  );
}

function SharePageData({
  type,
  uuid,
}: {
  type: DataOperationType;
  uuid: string;
}) {
  if (type === 'folder') return <FolderShareDisplay uuid={uuid} />;
  if (type === 'file') return <FileShareDisplay uuid={uuid} />;
  return null;
}
