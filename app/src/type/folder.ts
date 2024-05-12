export interface FolderModel {
  id: number;
  user_id: number;
  folder_name: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}
