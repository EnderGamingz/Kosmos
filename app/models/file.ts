import { ContextData } from '@hooks/useContextMenu.ts';
import { Selected } from '@pages/explorer/fileTable.tsx';

export enum FileType {
  Generic = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  Document = 4,
  RawImage = 5,
  LargeImage = 6,
  Archive,
}

export type FileModel = {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: number;
  mime_type: string;
  metadata?: never;
  parent_folder_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type DataOperationType = 'file' | 'folder';

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
    case FileType.Archive:
      return 'Archive';
    default:
      return 'Unknown';
  }
}

export function isFileModel(data: ContextData): data is FileModel {
  return (data as FileModel).file_name !== undefined;
}

export function isMultiple(data: ContextData): data is Selected {
  return (
    (data as Selected).files !== undefined &&
    (data as Selected).folders !== undefined
  );
}
