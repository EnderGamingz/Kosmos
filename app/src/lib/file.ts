import { BASE_URL } from '@lib/env.ts';

export const createDownloadUrl = (
  shareUuid?: string,
  folderShareUuid?: string,
  fileId?: string,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/${fileId}/action/Download`;
  return folderShareUuid
    ? `${BASE_URL}s/folder/${folderShareUuid}/File/${fileId}/action/Download`
    : `${BASE_URL}s/file/${shareUuid}/action/Download`;
};

export const createServeUrl = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/${fileId}/action/Serve`;
  return isSharedInFolder
    ? `${BASE_URL}s/folder/${shareUuid}/File/${fileId}/action/Serve`
    : `${BASE_URL}s/file/${shareUuid}/action/Serve`;
};

export const createPreviewUrl = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/image/${fileId}/0`;
  return isSharedInFolder
    ? `${BASE_URL}s/folder/${shareUuid}/image/${fileId}/0`
    : `${BASE_URL}s/file/${shareUuid}/image/0`;
};
