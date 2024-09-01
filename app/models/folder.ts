import { ContextData } from '@hooks/useContextMenu.ts';
import { ShareFileModel } from '@models/file.ts';

export type FolderModel = {
  id: string;
  user_id: string;
  folder_name: string;
  parent_id?: string;
  favorite: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
};

export type ShareFolderModel = {
  id: string;
  folder_name: string;
  parent_id?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  share_uuid?: string;
  share_target_username?: string;
};

export type FolderResponse = {
  folder?: FolderModel;
  folders: FolderModel[];
  structure?: SimpleDirectory[];
};

export type FolderShareResponse = {
  folder?: ShareFolderModel;
  folders: ShareFolderModel[];
  files: ShareFileModel[];
  structure: SimpleDirectory[];
};

export type SimpleDirectory = {
  id: string;
  folder_name: string;
};

export function isFolderModel(data: ContextData): data is FolderModel {
  return (data as FolderModel).folder_name !== undefined;
}
