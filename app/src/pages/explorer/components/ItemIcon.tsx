import { FilePreviewStatus, FileType } from '@models/file.ts';
import { PreviewImage } from '@components/Image.tsx';
import { motion } from 'framer-motion';
import { cn } from '@lib/utils.ts';
import {
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  FolderArchive,
  FolderClosed,
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
      return <FolderClosed />;
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
  keySuffix,
}: {
  id: string;
  type: FileIcon;
  name: string;
  status?: FilePreviewStatus | null;
  dynamic?: boolean;
  disablePreview?: boolean;
  color?: string | null;
  keySuffix?: string;
}) {
  // Only use layout component when suffix exists
  const layoutId = keySuffix ? `type-${id}-${keySuffix}` : undefined;
  const Component = keySuffix ? motion.div : 'div';
  const props = {
    className: cn(
      'icon-container pointer-events-none',
      'text-stone-700 shadow-inherit [&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2',
      'dark:shadow-inherit-dark dark:text-stone-300',
    ),
    style: {
      color: color || undefined,
    },
    ...(keySuffix && { layoutId }),
  };
  return (
    <Component {...props}>
      {getFileIcon(type, id, name, status, dynamic, disablePreview)}
    </Component>
  );
}
