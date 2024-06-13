import { FileType } from '@models/file.ts';
import { BASE_URL } from '@lib/vars.ts';
import {
  ArchiveBoxIcon,
  DocumentIcon,
  DocumentTextIcon,
  FilmIcon,
  MusicalNoteIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { PreviewImage } from '@components/Image.tsx';

function getFileIcon(type: FileType, id: undefined | string, name: string) {
  switch (type) {
    case FileType.Image:
    case FileType.RawImage:
      return (
        <PreviewImage src={`${BASE_URL}auth/file/image/${id}/0`} alt={name} />
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
    default:
      return <DocumentIcon />;
  }
}

export default function ItemIcon({
  type,
  name,
  id,
}: {
  type: FileType;
  name: string;
  id?: string;
}) {
  return (
    <div className={'[&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2'}>
      {getFileIcon(type, id, name)}
    </div>
  );
}
