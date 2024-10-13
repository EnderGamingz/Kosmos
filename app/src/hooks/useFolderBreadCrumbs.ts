import { FolderResponse } from '@bindings/FolderResponse.ts';
import { useEffect, useState } from 'react';
import { SimpleDirectoryDTO } from '@bindings/SimpleDirectoryDTO.ts';

export function useFolderBreadCrumbs(folders?: FolderResponse) {
  const [breadCrumbs, setBreadCrumbs] = useState<SimpleDirectoryDTO[]>([]);
  useEffect(() => {
    if (!folders) return;
    if (!folders.structure) {
      setBreadCrumbs([]);
    } else if (folders.structure.length > 0) {
      setBreadCrumbs(folders.structure);
    }
  }, [folders]);

  return breadCrumbs;
}