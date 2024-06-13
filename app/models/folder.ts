import { FileModel } from '@models/file.ts';

export interface FolderModel {
  id: string;
  user_id: string;
  folder_name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FolderResponse {
  folder?: FolderModel;
  folders: FolderModel[];
  structure?: SimpleDirectory[];
}

export interface SimpleDirectory {
  id: string;
  folder_name: string;
}

export function isFolderModel(
  data: FileModel | FolderModel | undefined,
): data is FolderModel {
  return (data as FolderModel).folder_name !== undefined;
}
