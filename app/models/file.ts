export enum FileType {
  Generic = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  Document = 4,
  RawImage = 5,
}

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

export function getFileTypeById(num: number): FileType {
  switch (num) {
    case 1:
      return FileType.Image;
    case 2:
      return FileType.Video;
    case 3:
      return FileType.Audio;
    case 4:
      return FileType.Document;
    case 5:
      return FileType.RawImage;
    default:
      return FileType.Generic;
  }
}
