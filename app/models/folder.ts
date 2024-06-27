import { ContextData } from '@hooks/useContextMenu.ts';

export type FolderModel = {
  id: string;
  user_id: string;
  folder_name: string;
  parent_id?: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type FolderResponse = {
  folder?: FolderModel;
  folders: FolderModel[];
  structure?: SimpleDirectory[];
};

export type SimpleDirectory = {
  id: string;
  folder_name: string;
};

export function isFolderModel(data: ContextData): data is FolderModel {
  return (data as FolderModel).folder_name !== undefined;
}
