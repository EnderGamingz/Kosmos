import { FileModel } from '@models/file.ts';
import { FolderModel } from '@models/folder.ts';
import { AlbumModel } from '@models/album.ts';

export enum ShareType {
  Public,
  Private,
}

export function getShareTypeString(type: ShareType, lower?: boolean) {
  switch (type) {
    case ShareType.Public:
      return lower ? 'public' : 'Public';
    case ShareType.Private:
      return lower ? 'private' : 'Private';
  }
}

export type ShareModel = {
  id: string;
  uuid: string;
  user_id: number;
  file_id?: number;
  folder_id?: number;
  share_type: number;
  share_target?: number;
  share_target_username?: string;
  access_limit?: number;
  password?: string;
  access_count: number;
  last_access?: number;
  created_at: Date;
  expires_at?: Date;
  updated_at: Date;
};

export type SharedItemsResponse = {
  files: FileModel[];
  folders: FolderModel[];
  albums: AlbumModel[];
};
