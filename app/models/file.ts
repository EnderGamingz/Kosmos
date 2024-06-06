export enum FileType {
  Generic = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  Document = 4,
  RawImage = 5,
  LargeImage = 6,
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
  deleted_at?: string;
}

export type OperationType = 'file' | 'folder';

/**
 * Retrieves the file type based on the given ID.
 *
 * @param {number} id - The ID of the file type.
 *
 * @return {FileType} - The corresponding file type.
 */
export function normalizeFileType(id: number): FileType {
  return id in FileType ? id : FileType.Generic;
}

export function getFileTypeString(id: number): string {
  switch (id) {
    case FileType.Generic:
      return 'Generic';
    case FileType.Image:
      return 'Image';
    case FileType.Video:
      return 'Video';
    case FileType.Audio:
      return 'Audio';
    case FileType.Document:
      return 'Document';
    case FileType.RawImage:
      return 'Raw Image';
    case FileType.LargeImage:
      return 'Large Image';
    default:
      return 'Unknown';
  }
}
