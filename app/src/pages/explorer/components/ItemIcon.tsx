import { FilePreviewStatus, FileType } from '@models/file.ts';
import {
  ArchiveBoxIcon,
  DocumentIcon,
  DocumentTextIcon,
  FilmIcon,
  FolderIcon,
  MusicalNoteIcon,
  PhotoIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import { PreviewImage } from '@components/Image.tsx';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';

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
      if (disablePreview) return <PhotoIcon />;
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
      return <FilmIcon />;
    case FileType.Editable:
    case FileType.Document:
      return <DocumentTextIcon />;
    case FileType.Audio:
      return <MusicalNoteIcon />;
    case FileType.LargeImage:
      return <PhotoIcon />;
    case FileType.Archive:
      return <ArchiveBoxIcon />;
    case 'folder':
      return <FolderIcon />;
    case 'album':
      return <Square2StackIcon />;
    default:
      return <DocumentIcon />;
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
    className: tw(
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
