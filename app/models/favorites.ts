import { FileModel } from './file';
import { FolderModel } from './folder';

export type FavoritesResponse = {
  files: FileModel[];
  folders: FolderModel[];
};
