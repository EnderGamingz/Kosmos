import { FileModel, FileType } from './file';
import { ContextData } from '@hooks/useContextMenu.ts';

export type AlbumModel = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
};

export type AlbumFile = FileModel & {
  album_id: string;
};

export type AlbumResponse = {
  album: AlbumModel;
  files: FileModel[];
};

export type CreateAlbumPayload = {
  name: string;
  description?: string;
};

export type UpdateAlbumPayload = {
  id: string;
  name?: string;
  description?: string;
};

export type AvailableAlbumsForFileResponse = {
  added: AlbumModel[];
  available: AlbumModel[];
};

export function isAlbumFile(data: ContextData): data is AlbumFile {
  return (
    (data as AlbumFile).file_name !== undefined &&
    (data as AlbumFile).album_id !== undefined
  );
}

export function isValidFileForAlbum(file: FileModel) {
  return [FileType.Image, FileType.RawImage, FileType.LargeImage].includes(
    file.file_type,
  );
}
