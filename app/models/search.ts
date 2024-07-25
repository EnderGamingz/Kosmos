import { FileModel } from './file';
import { FolderModel } from './folder';

export type SearchResponse = {
  files: FileModel[];
  folders: FolderModel[];
};
