import { FileType } from './file';
import type { ContextData } from '@hooks/useContextMenu.ts';
import type { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { ShareFileModelDTO } from '@bindings/ShareFileModelDTO.ts';

export type AlbumFile = FileModelDTO & {
  album: AlbumModelDTO;
};

export type AlbumResponse = {
  album: AlbumModelDTO;
  files: FileModelDTO[];
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
  added: AlbumModelDTO[];
  available: AlbumModelDTO[];
};

export type AlbumShareResponse = {
  album: AlbumModelDTO;
  files: ShareFileModelDTO[];
};

export function isAlbumFile(data: ContextData): data is AlbumFile {
  return (
    (data as AlbumFile).file_name !== undefined &&
    (data as AlbumFile).album?.id !== undefined
  );
}

export function isValidFileForAlbum(file: FileModelDTO) {
  return [FileType.Image, FileType.RawImage].includes(file.file_type);
}

export function isValidFileForAvatar(file: FileModelDTO) {
  return [FileType.Image, FileType.RawImage].includes(file.file_type);
}
