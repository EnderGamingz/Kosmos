import { useParams } from 'react-router-dom';
import { DataOperationType } from '@models/file.ts';
import { FileShareDisplay } from '@pages/share/fileShareDisplay.tsx';
import { AxiosError } from 'axios';
import { FolderShareDisplay } from '@pages/share/folderShareDisplay.tsx';

export function ShareMessage({
  text,
  loading,
}: {
  text: string;
  loading?: boolean;
}) {
  return (
    <div className={'flex flex-grow items-center justify-center'}>
      <div
        className={'flex flex-col items-center gap-2 text-xl text-stone-600'}>
        {loading && (
          <div
            className={'app-loading-indicator !h-7 !w-7 !border-t-stone-700'}
          />
        )}
        {text}
      </div>
    </div>
  );
}

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

export function ShareError({
  error,
  type,
}: {
  error?: AxiosError;
  type: DataOperationType;
}) {
  const errorStatus = (error as AxiosError)?.response?.status;
  const errorText =
    errorStatus === 404 ? 'Share not found' : `Error loading ${type} share`;
  return <ShareMessage text={errorText} />;
}
