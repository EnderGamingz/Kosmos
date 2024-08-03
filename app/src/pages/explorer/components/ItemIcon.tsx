import { FilePreviewStatus, FileType } from '@models/file.ts';
import {
  ArchiveBoxIcon,
  DocumentIcon,
  DocumentTextIcon,
  FilmIcon,
  FolderIcon,
  MusicalNoteIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { PreviewImage } from '@components/Image.tsx';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';

function getFileIcon(
  type: FileType | 'folder',
  id: string,
  name: string,
  status: undefined | FilePreviewStatus,
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
}: {
  id: string;
  type: FileType | 'folder';
  name: string;
  status?: FilePreviewStatus;
  dynamic?: boolean;
  disablePreview?: boolean;
}) {
  return (
    <motion.div
      /*layoutId={`type-${id}`}*/
      className={tw(
        'icon-container pointer-events-none',
        'text-stone-700 shadow-inherit [&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2',
      )}>
      {getFileIcon(type, id, name, status, dynamic, disablePreview)}
    </motion.div>
  );
}
