import { FileModel } from './file';

export type AlbumModel = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
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
