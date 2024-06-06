import { FileType } from '../../../../models/file.ts';
import { BASE_URL } from '../../../vars.ts';
import {
  DocumentIcon,
  DocumentTextIcon,
  FilmIcon,
  MusicalNoteIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { Image } from '@nextui-org/react';

function getFileIcon(type: FileType, id: undefined | string, name: string) {
  switch (type) {
    case FileType.Image:
    case FileType.RawImage:
      return (
        <Image
          loading={'lazy'}
          className={'img aspect-square h-10 w-10 rounded-lg object-cover'}
          src={`${BASE_URL}auth/file/image/${id}/0`}
          alt={name}
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
