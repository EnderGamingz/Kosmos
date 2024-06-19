import { FilePreviewStatus, FileType } from '@models/file.ts';
import { BASE_URL } from '@lib/vars.ts';
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

function getFileIcon(
  type: FileType | 'folder',
  id: string,
  name: string,
  status: undefined | FilePreviewStatus,
) {
  switch (type) {
    case FileType.Image:
    case FileType.RawImage:
      return (
        <PreviewImage
          id={id}
          status={status}
          src={`${BASE_URL}auth/file/image/${id}/0`}
          alt={name}
          type={type}
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
}: {
  id: string;
  type: FileType | 'folder';
  name: string;
  status?: FilePreviewStatus;
}) {
  return (
    <motion.div
      layoutId={`type-${id}`}
      className={'text-stone-700 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2'}>
      {getFileIcon(type, id, name, status)}
    </motion.div>
  );
}
