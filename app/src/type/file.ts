export interface FileModel {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: number;
  mime_type: string;
  metadata?: any;
  parent_folder_id?: string;
  created_at: string;
  updated_at: string;
}
