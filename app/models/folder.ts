import type { ContextData } from '@hooks/useContextMenu.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export function isFolderModel(data: ContextData): data is FolderModelDTO {
  return (data as FolderModelDTO).folder_name !== undefined;
}
