import { BASE_URL } from '@lib/env.ts';

export const createDownloadUrl = (
  shareUuid?: string,
  folderShareUuid?: string,
  fileId?: string,
  isSharedAlbum?: boolean,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/${fileId}/action/Download`;
  if (isSharedAlbum)
    return `${BASE_URL}s/album/${shareUuid}/file/${fileId}/action/Download`;
  return folderShareUuid
    ? `${BASE_URL}s/folder/${folderShareUuid}/File/${fileId}/action/Download`
    : `${BASE_URL}s/file/${shareUuid}/action/Download`;
};

export const createServeUrl = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string | null,
  isSharedAlbum?: boolean,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/${fileId}/action/Serve`;
  if (isSharedAlbum)
    return `${BASE_URL}s/album/${shareUuid}/file/${fileId}/action/Serve`;
  return isSharedInFolder
    ? `${BASE_URL}s/folder/${shareUuid}/File/${fileId}/action/Serve`
    : `${BASE_URL}s/file/${shareUuid}/action/Serve`;
};

export const createPreviewUrl = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string | null,
  isSharedAlbum?: boolean,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/image/${fileId}/0`;
  if (isSharedAlbum) return `${BASE_URL}s/album/${shareUuid}/image/${fileId}/0`;
  return isSharedInFolder
    ? `${BASE_URL}s/folder/${shareUuid}/image/${fileId}/0`
    : `${BASE_URL}s/file/${shareUuid}/image/0`;
};

export const createZipInformationUrl = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string | null,
) => {
  if (!shareUuid) return `${BASE_URL}auth/file/zip/${fileId}`;
  return isSharedInFolder
    ? `${BASE_URL}s/folder/${shareUuid}/Zip/${fileId}`
    : `${BASE_URL}s/file/${shareUuid}/zip`;
};
