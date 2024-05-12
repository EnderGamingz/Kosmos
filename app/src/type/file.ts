export interface FileModel {
  id: number;
  user_id: number;
  file_name: string;
  file_size: number;
  file_type: number;
  mime_type: string;
  metadata?: any;
  parent_folder_id?: number;
  created_at: string;
  updated_at: string;
}
