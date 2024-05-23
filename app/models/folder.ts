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
}
