import { ContextData } from '@hooks/useContextMenu.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export enum FileType {
  Generic,
  Image,
  Video,
  Audio,
  Document,
  RawImage,
  LargeImage,
  Archive,
  Editable,
}

export class FileTypeActions {
  static isImage(id: number) {
    return [FileType.Image, FileType.RawImage].includes(id);
  }

  static isVideo(id: number) {
    return [FileType.Video].includes(id);
  }

  static canOpenExternal(data: FileModelDTO) {
    return [FileType.Document, FileType.Video].includes(data.file_type);
  }

  static hasPreview(data: FileModelDTO) {
    return [FileType.Image, FileType.RawImage].includes(data.file_type);
  }

  static hasFileEmbedData(data: FileModelDTO) {
    return [FileType.Document, FileType.Editable].includes(data.file_type);
  }

  static canEditContent(data: FileModelDTO) {
    return data.file_type === FileType.Editable;
  }

  static isMarkdown(data: FileModelDTO) {
    return this.canEditContent(data) && data.mime_type === 'text/markdown';
  }

  static shouldDelayPreview(data: FileModelDTO) {
    return [
      FileType.Image,
      FileType.Document,
      FileType.Audio,
      FileType.Video,
    ].includes(data.file_type);
  }
}

export enum FilePreviewStatus {
  Unavailable,
  Ready,
  Failed,
  Processing,
}

export type DataOperationType = 'file' | 'folder';
export type ContextOperationType = DataOperationType | 'multi';
export type ShareOperationType = DataOperationType | 'album';

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
      return 'Large or Unsupported Image';
    case FileType.Archive:
      return 'Archive';
    case FileType.Editable:
      return 'Editable Document';
    default:
      return 'Generic';
  }
}

export function isFileModel(data: ContextData): data is FileModelDTO {
  return (data as FileModelDTO).file_name !== undefined;
}

export type Selected = { files: string[]; folders: string[] };

export function isMultiple(data: ContextData): data is Selected {
  return (
    (data as Selected).files !== undefined &&
    (data as Selected).folders !== undefined
  );
}
