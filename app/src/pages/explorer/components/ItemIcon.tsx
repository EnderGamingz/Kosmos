import { type FilePreviewStatus, FileType } from '@models/file.ts';
import { PreviewImage } from '@components/Image.tsx';
import { cn } from '@lib/utils.ts';
import {
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  FolderArchive,
  FolderClosed,
  FolderOpen,
  Images,
} from 'lucide-react';

type FileIcon = FileType | 'folder' | 'album';

function getFileIcon(
  type: FileIcon,
  id: string,
  name: string,
  status?: FilePreviewStatus | null,
  dynamic?: boolean,
  disablePreview?: boolean,
) {
  switch (type) {
    case FileType.Image:
    case FileType.RawImage:
      if (disablePreview) return <FileImage />;
      return (
        <PreviewImage
          id={id}
          status={status}
          alt={name}
          type={type}
          dynamic={dynamic}
        />
      );
    case FileType.Video:
      return <FileVideo />;
    case FileType.Editable:
    case FileType.Document:
      return <FileText />;
    case FileType.Audio:
      return <FileAudio />;
    case FileType.LargeImage:
      return <FileImage />;
    case FileType.Archive:
      return <FolderArchive />;
    case 'folder':
      return (
        <>
          <FolderClosed className={'group-hover/listItem:hidden'} />
          <FolderOpen className={'hidden group-hover/listItem:block'} />
        </>
      );
    case 'album':
      return <Images />;
    default:
      return <File />;
  }
}

export default function ItemIcon({
  id,
  type,
  name,
  status,
  dynamic,
  disablePreview,
  color,
}: {
  id: string;
  type: FileIcon;
  name: string;
  status?: FilePreviewStatus | null;
  dynamic?: boolean;
  disablePreview?: boolean;
  color?: string | null;
}) {
  return (
    <div
      className={cn(
        'icon-container pointer-events-none',
        'text-stone-700 shadow-inherit [&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2',
        'dark:shadow-inherit-dark dark:text-stone-300',
      )}
      style={{
        color: color || undefined,
      }}
    >
      {getFileIcon(type, id, name, status, dynamic, disablePreview)}
    </div>
  );
}
